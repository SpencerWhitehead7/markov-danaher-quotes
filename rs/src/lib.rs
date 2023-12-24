use std::collections::HashMap;
use std::fs;
use std::thread;

fn is_end_of_sentence(word: &str) -> bool {
  let last_letter = match word.chars().last() {
    Some(letter) => letter,
    None => return false,
  };

  last_letter == '.' || last_letter == '!' || last_letter == '?'
}

type FreqTableBranch = HashMap<String, f32>;
type FreqTableTrunk = HashMap<String, FreqTableBranch>;
#[derive(Debug)]
struct FreqTable {
  begin: FreqTableTrunk,
  middle: FreqTableTrunk,
  end: FreqTableTrunk,
}

impl FreqTable {
  fn new(text: &str, markov_num: usize) -> Self {
    let words: Vec<&str> = text.split_whitespace().collect();

    let mut begin = FreqTableTrunk::from([(
      "QUOTE".to_string(),
      HashMap::from([(words[0..markov_num].join(" "), 1.0)]),
    )]);
    let mut middle = FreqTableTrunk::new();
    let mut end = FreqTableTrunk::new();

    for i in markov_num..words.len() {
      let prev = words[i - markov_num..i].join(" ");
      let word = words[i];

      if is_end_of_sentence(&word) {
        if i != words.len() - 1 {
          let next_sentence_start = words[i + 1..i + 1 + markov_num].join(" ");
          *begin
            .entry("QUOTE".to_string())
            .or_insert(HashMap::new())
            .entry(next_sentence_start)
            .or_insert(0.0) += 1.0;
        }

        *end
          .entry(prev.to_string())
          .or_insert(HashMap::new())
          .entry(word.to_string())
          .or_insert(0.0) += 1.0;
      }

      *middle
        .entry(prev.to_string())
        .or_insert(HashMap::new())
        .entry(word.to_string())
        .or_insert(0.0) += 1.0;
    }

    FreqTable { begin, middle, end }
  }
}

type MarkovChainBranch = HashMap<String, (f32, f32)>;
type MarkovChainTrunk = HashMap<String, MarkovChainBranch>;
#[derive(Debug, serde_derive::Serialize, serde_derive::Deserialize)]
pub struct MarkovChain {
  num: usize,

  begin: MarkovChainTrunk,
  middle: MarkovChainTrunk,
  end: MarkovChainTrunk,
}

impl MarkovChain {
  pub fn new(text: &str, num: usize) -> Self {
    let freq_table = FreqTable::new(text, num);

    MarkovChain {
      num,
      begin: Self::freq_table_trunk_to_markov_chain_trunk(freq_table.begin),
      middle: Self::freq_table_trunk_to_markov_chain_trunk(freq_table.middle),
      end: Self::freq_table_trunk_to_markov_chain_trunk(freq_table.end),
    }
  }

  fn freq_table_trunk_to_markov_chain_trunk(freq_trunk: FreqTableTrunk) -> MarkovChainTrunk {
    let mut markov_trunk = MarkovChainTrunk::new();

    for (root_word, next_words) in freq_trunk {
      let sum = next_words.values().fold(0.0, |acc, curr| acc + curr);
      let mut lower_bound = 0.0;
      markov_trunk.insert(
        root_word,
        next_words
          .keys()
          .fold(MarkovChainBranch::new(), |mut acc, curr| {
            let upper_bound = lower_bound + (next_words[curr] / sum);
            acc.insert(curr.to_string(), (lower_bound, upper_bound));
            lower_bound = upper_bound;
            acc
          }),
      );
    }

    markov_trunk
  }

  fn pick_next_word(word_node: &MarkovChainBranch) -> &str {
    let selector = &rand::random::<f32>();
    for (next_word, (lower_bound, upper_bound)) in word_node {
      if lower_bound <= selector && selector < upper_bound {
        return next_word;
      }
    }
    ""
  }

  pub fn generate_quote_by_sentences(&self, sentence_count: usize) -> String {
    let mut quote = Self::pick_next_word(self.begin.get("QUOTE").unwrap())
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
      while !is_end_of_sentence(quote.last().unwrap()) {
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
    let mut quote = Self::pick_next_word(self.begin.get("QUOTE").unwrap())
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
}

fn generate_metadata(text: &str) -> HashMap<&str, usize> {
  let word_count = text.split_whitespace().count();
  let sentence_count = text.split(&['.', '!', '?'][..]).count();

  HashMap::from([
    ("wordCount", word_count),
    ("sentenceCount", sentence_count),
    ("wordsPerSentence", word_count / sentence_count),
  ])
}

pub fn generate_markovs(text: &str, max_markov_num: usize) {
  let local_text = text.to_string();
  let mut children = vec![thread::spawn(move || {
    let metadata = generate_metadata(&local_text);

    println!("{:?}", metadata);

    ciborium::into_writer(
      &metadata,
      fs::File::create("../rsResources/markovMetadata").unwrap(),
    )
    .unwrap()
  })];

  for markov_num in 1..=max_markov_num {
    let local_text = text.to_string();

    children.push(thread::spawn(move || {
      ciborium::into_writer(
        &MarkovChain::new(&local_text, markov_num),
        fs::File::create(format!("../rsResources/markov{}", markov_num)).unwrap(),
      )
      .unwrap();
    }))
  }

  for child in children {
    child.join().unwrap()
  }
}
