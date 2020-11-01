use std::collections::HashMap;
use std::fs;
use std::thread;

use serde_cbor;

fn is_end_of_sentence(word: &str) -> bool {
  let last_letter = match word.chars().last() {
    Some(letter) => letter,
    None => return false,
  };

  last_letter == '.' || last_letter == '!' || last_letter == '?'
}

type FreqTableLeaf = f32;
type FreqTableBranch = HashMap<String, FreqTableLeaf>;
type FreqTableTrunk = HashMap<String, FreqTableBranch>;
type FreqTable = HashMap<&'static str, FreqTableTrunk>;
fn words_to_freq_table(text: &str, markov_num: usize) -> FreqTable {
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

  HashMap::from([("BEGIN", begin), ("MIDDLE", middle), ("END", end)])
}

type MarkovChainLeaf = [f32; 2];
type MarkovChainBranch = HashMap<String, MarkovChainLeaf>;
type MarkovChainTrunk = HashMap<String, MarkovChainBranch>;
type MarkovChain = HashMap<&'static str, MarkovChainTrunk>;
fn freq_table_to_markov(freq_table: FreqTable) -> MarkovChain {
  let mut markov: MarkovChain = HashMap::new();

  for (root, nexts) in freq_table {
    let mut markov_nexts = MarkovChainTrunk::new();
    for (root_word, next_words) in nexts {
      let sum = next_words.values().fold(0.0, |acc, curr| acc + curr);
      let mut lower_bound = 0.0;
      markov_nexts.insert(
        root_word,
        next_words
          .keys()
          .fold(MarkovChainBranch::new(), |mut acc, curr| {
            let upper_bound = lower_bound + (next_words[curr] / sum);
            acc.insert(curr.to_string(), [lower_bound, upper_bound]);
            lower_bound = upper_bound;
            acc
          }),
      );
    }
    markov.insert(root, markov_nexts);
  }
  markov
}

pub fn generate(text: &str, max_markov_num: usize) {
  let mut children = vec![];
  for markov_num in 1..=max_markov_num {
    let local_text = text.to_string();
    children.push(thread::spawn(move || {
      serde_cbor::to_writer(
        fs::File::create(format!("rsResources/markov{}", markov_num)).unwrap(),
        &freq_table_to_markov(words_to_freq_table(&local_text, markov_num)),
      )
      .unwrap();
    }))
  }
  for child in children {
    child.join().unwrap()
  }
}
