use std::collections::HashMap;
use std::fs;
use std::io;

use rand::seq::IndexedRandom as _;

type MarkovChainBranch = Vec<String>;
type MarkovChainTrunk = HashMap<String, MarkovChainBranch>;
#[derive(Debug, serde::Serialize, serde::Deserialize)]
pub struct MarkovChain {
  num: usize,

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
    let mut quote = Self::pick_next_word(&self.begin)
      .split(' ')
      .collect::<Vec<&str>>();
    for _ in 0..sentence_count {
      // default length of sentence
      for _ in 0..17 - 1 {
        quote.push(Self::pick_next_word(
          self
            .middle
            .get(&quote[quote.len() - self.num..quote.len()].join(" "))
            .unwrap(),
        ))
      }
      while !MarkovChain::is_end_of_sentence(quote.last().unwrap()) {
        let prev_phrase = &quote[quote.len() - self.num..quote.len()].join(" ");
        let word_node = match self.end.get(prev_phrase) {
          Some(node) => node,
          None => self.middle.get(prev_phrase).unwrap(),
        };
        quote.push(Self::pick_next_word(word_node))
      }
    }
    quote.join(" ")
  }

  pub fn generate_quote_by_words(&self, word_count: usize) -> String {
    let mut quote = Self::pick_next_word(&self.begin)
      .split(' ')
      .collect::<Vec<&str>>();
    for _ in self.num..word_count {
      quote.push(Self::pick_next_word(
        self
          .middle
          .get(&quote[quote.len() - self.num..quote.len()].join(" "))
          .unwrap(),
      ))
    }
    quote.join(" ")
  }

  fn is_end_of_sentence(word: &str) -> bool {
    let last_letter = match word.chars().last() {
      Some(letter) => letter,
      None => return false,
    };

    last_letter == '.' || last_letter == '!' || last_letter == '?'
  }

  fn pick_next_word(word_node: &MarkovChainBranch) -> &str {
    let mut rng = rand::rng();
    word_node.choose(&mut rng).unwrap()
  }
}

pub fn generate_markovs(text: &str, max_markov_num: usize) {
  let normalized_text = regex::Regex::new(r"\s+")
    .unwrap()
    .replace_all(text, " ")
    .trim()
    .to_string();

  let words = normalized_text.split(" ").collect::<Vec<_>>();
  let sentence_count = regex::Regex::new(r"[.!?]+")
    .unwrap()
    .split(&normalized_text)
    .count();

  let metadata = HashMap::from([
    ("wordCount", words.len()),
    ("sentenceCount", sentence_count),
    ("wordsPerSentence", words.len() / sentence_count),
  ]);

  println!("{:?}", metadata);

  ciborium::into_writer(
    &metadata,
    fs::File::create("../rsResources/markovMetadata").unwrap(),
  )
  .unwrap();

  for markov_num in 1..=max_markov_num {
    ciborium::into_writer(
      &MarkovChain::new(markov_num, &words),
      io::BufWriter::new(fs::File::create(format!("../rsResources/markov{}", markov_num)).unwrap()),
    )
    .unwrap();
  }
}
