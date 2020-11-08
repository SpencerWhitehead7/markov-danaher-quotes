use std::collections::HashMap;

use rand;

type WordNode = HashMap<String, [f32; 2]>;
pub type MarkovChain = HashMap<String, HashMap<String, WordNode>>;

fn is_end_of_sentence(word: &str) -> bool {
  let last_letter = match word.chars().last() {
    Some(letter) => letter,
    None => return false,
  };

  last_letter == '.' || last_letter == '!' || last_letter == '?'
}

fn pick_next_word(word_node: &WordNode) -> &str {
  let selector = &rand::random::<f32>();
  for (next_word, [lower_bound, upper_bound]) in word_node {
    if lower_bound <= selector && selector < upper_bound {
      return next_word;
    }
  }
  ""
}

pub fn generate_by_sentences(
  markov: &MarkovChain,
  markov_num: usize,
  sentence_count: usize,
) -> String {
  let mut quote = pick_next_word(markov.get("BEGIN").unwrap().get("QUOTE").unwrap())
    .split(' ')
    .collect::<Vec<&str>>();
  for _ in 0..sentence_count {
    // default length of sentence
    for _ in 0..17 - 1 {
      quote.push(pick_next_word(
        markov
          .get("MIDDLE")
          .unwrap()
          .get(&quote[quote.len() - markov_num..quote.len()].join(" "))
          .unwrap(),
      ))
    }
    while !is_end_of_sentence(quote.last().unwrap()) {
      let prev_phrase = &quote[quote.len() - markov_num..quote.len()].join(" ");
      let word_node = match markov.get("END").unwrap().get(prev_phrase) {
        Some(node) => node,
        None => markov.get("MIDDLE").unwrap().get(prev_phrase).unwrap(),
      };
      quote.push(pick_next_word(word_node))
    }
  }
  quote.join(" ")
}

pub fn generate_by_words(markov: &MarkovChain, markov_num: usize, word_count: usize) -> String {
  let mut quote = pick_next_word(markov.get("BEGIN").unwrap().get("QUOTE").unwrap())
    .split(' ')
    .collect::<Vec<&str>>();
  for _ in markov_num..word_count {
    quote.push(pick_next_word(
      markov
        .get("MIDDLE")
        .unwrap()
        .get(&quote[quote.len() - markov_num..quote.len()].join(" "))
        .unwrap(),
    ))
  }
  quote.join(" ")
}
