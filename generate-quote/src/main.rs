use std::env;
use std::fs;
use std::io;

mod quote;

fn main() {
  let markov_num_input = &env::args().nth(1).unwrap();
  let markov_num = markov_num_input.parse::<usize>().unwrap();

  let markov_path = format!("rsResources/markov{}", markov_num);
  let markov_file = fs::File::open(markov_path).unwrap();
  let markov_reader = io::BufReader::new(markov_file);
  let markov: quote::MarkovChain = serde_cbor::from_reader(markov_reader).unwrap();

  let sentence_count_input = &env::args().nth(2).unwrap();
  let sentence_count = sentence_count_input.parse::<usize>().unwrap();

  let quote = quote::generate_by_sentences(&markov, markov_num, sentence_count);
  println!("{}", quote);
}
