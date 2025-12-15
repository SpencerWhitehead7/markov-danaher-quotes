use std::collections::HashMap;
use std::thread;

use rand::seq::IndexedRandom as _;

type MarkovChainBranch = Vec<String>;
type MarkovChainTrunk = HashMap<String, MarkovChainBranch>;
#[derive(Debug, serde::Serialize, serde::Deserialize)]
pub struct MarkovChain {
  pub num: usize,

  begin: MarkovChainBranch,
  middle: MarkovChainTrunk,
  end: MarkovChainTrunk,
}

impl MarkovChain {
  pub fn new(markov_num: usize, words: &Vec<&str>) -> Self {
    let mut begin = MarkovChainBranch::from([words[0..markov_num].join(" ")]);
    let mut middle = MarkovChainTrunk::new();
    let mut end = MarkovChainTrunk::new();

    for i in markov_num..words.len() {
      let prev = words[i - markov_num..i].join(" ");
      let word = words[i];

      if MarkovChain::is_end_of_sentence(&word) {
        if i != words.len() - 1 {
          let next_sentence_start = words[i + 1..i + 1 + markov_num].join(" ");
          begin.push(next_sentence_start);
        }

        end
          .entry(prev.to_string())
          .or_insert(Vec::new())
          .push(word.to_string());
      }

      middle
        .entry(prev)
        .or_insert(Vec::new())
        .push(word.to_string());
    }

    MarkovChain {
      num: markov_num,
      begin,
      middle,
      end,
    }
  }

  pub fn generate_quote_by_sentences(&self, sentence_count: usize) -> String {
    let mut rng = rand::rng();

    let mut quote = self
      .begin
      .choose(&mut rng)
      .unwrap()
      .split(' ')
      .collect::<Vec<&str>>();
    for _ in 0..sentence_count {
      // default length of sentence
      for _ in 0..17 - 1 {
        let prev_phrase = &quote[quote.len() - self.num..quote.len()].join(" ");
        let word_node = match self.middle.get(prev_phrase) {
          Some(v) => v,
          None => &self.begin,
        };
        let word = word_node.choose(&mut rng).unwrap();
        quote.push(word);
      }

      while !MarkovChain::is_end_of_sentence(quote.last().unwrap()) {
        let prev_phrase = &quote[quote.len() - self.num..quote.len()].join(" ");
        let word_node = match self.end.get(prev_phrase) {
          Some(v) => v,
          None => match self.middle.get(prev_phrase) {
            Some(v) => v,
            None => &self.begin,
          },
        };
        let word = word_node.choose(&mut rng).unwrap();
        quote.push(word);
      }
    }
    quote.join(" ")
  }

  pub fn generate_quote_by_words(&self, word_count: usize) -> String {
    let mut rng = rand::rng();

    let mut quote = self
      .begin
      .choose(&mut rng)
      .unwrap()
      .split(' ')
      .collect::<Vec<&str>>();
    for _ in self.num..word_count {
      let prev_phrase = &quote[quote.len() - self.num..quote.len()].join(" ");
      let word_node = match self.middle.get(prev_phrase) {
        Some(v) => v,
        None => &self.begin,
      };
      let word = word_node.choose(&mut rng).unwrap();
      quote.push(word);
    }
    quote.join(" ")
  }

  fn is_end_of_sentence(word: &str) -> bool {
    match word.chars().last() {
      Some(c) => c == '.' || c == '!' || c == '?',
      None => false,
    }
  }
}

pub fn generate_markovs(
  text: &str,
  max_markov_num: usize,
) -> (HashMap<&str, f32>, Vec<MarkovChain>) {
  let words = &regex::Regex::new(r"\s+")
    .unwrap()
    .split(text)
    .collect::<Vec<_>>();

  let sentence_count = regex::Regex::new(r"[.!?]+").unwrap().split(text).count();

  let metadata = HashMap::from([
    ("wordCount", words.len() as f32),
    ("sentenceCount", sentence_count as f32),
    (
      "wordsPerSentence",
      words.len() as f32 / sentence_count as f32,
    ),
  ]);

  let markov_chains = thread::scope(|s| {
    (1..=max_markov_num)
      .map(|markov_num| s.spawn(move || MarkovChain::new(markov_num, words)))
      .collect::<Vec<_>>()
      .into_iter()
      .map(|h| h.join().unwrap())
      .collect::<Vec<_>>()
  });

  (metadata, markov_chains)
}
