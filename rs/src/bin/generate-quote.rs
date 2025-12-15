use std::env;
use std::fs;
use std::io;
use std::mem;
use std::process;

use markov_danaher_quotes::MarkovChain;

fn main() {
  let markov_num = match env::args().nth(1) {
    Some(v) => match v.parse::<usize>() {
      Ok(v) => v,
      Err(e) => {
        eprintln!(
          "the markov_num must be an positive integer of at most {}:: {}",
          usize::MAX,
          e
        );
        process::exit(1);
      }
    },
    None => {
      eprintln!("provide a markov_num as the first argument");
      process::exit(1)
    }
  };

  let sentence_count = match env::args().nth(2) {
    Some(v) => match v.parse::<usize>() {
      Ok(v) => v,
      Err(e) => {
        eprintln!(
          "the sentence_count must be an positive integer of at most {}:: {}",
          usize::MAX,
          e
        );
        process::exit(1);
      }
    },
    None => {
      eprintln!("provide a sentence_count as the second argument");
      process::exit(1)
    }
  };

  let markov_path = format!("../rsResources/markov{}", markov_num);
  let markov: MarkovChain = match fs::File::open(&markov_path) {
    Ok(v) => {
      let markov_reader = io::BufReader::new(v);
      match ciborium::from_reader(markov_reader) {
        Ok(v) => v,
        Err(e) => {
          eprintln!("failed to deserialize markov at {}:: {}", &markov_path, e);
          process::exit(1)
        }
      }
    }
    Err(e) => {
      eprintln!(
        "failed to open serialized markov at {}:: {}",
        &markov_path, e
      );
      process::exit(1)
    }
  };

  let quote = markov.generate_quote_by_sentences(sentence_count);

  println!("{}", quote);

  // Prevent dropping/deallocating markov_chains - leak it for the process lifetime
  // the OS will reclaim it on exit
  mem::forget(markov);
}
