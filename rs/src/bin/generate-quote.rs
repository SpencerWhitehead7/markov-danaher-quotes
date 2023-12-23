use std::env;
use std::fs;
use std::io;

use markov_danaher_quotes::{generate_quote_by_sentences, MarkovChain};

fn main() {
  let markov_num_input = &env::args().nth(1).unwrap();
  let markov_num = markov_num_input.parse::<usize>().unwrap();

  let markov_path = format!("../rsResources/markov{}", markov_num);
  let markov_file = fs::File::open(markov_path).unwrap();
  let markov_reader = io::BufReader::new(markov_file);
  let markov: MarkovChain = serde_cbor::from_reader(markov_reader).unwrap();

  let sentence_count_input = &env::args().nth(2).unwrap();
  let sentence_count = sentence_count_input.parse::<usize>().unwrap();

  let quote = generate_quote_by_sentences(&markov, markov_num, sentence_count);
  println!("{}", quote);
}
