use std::env;
use std::fs;
use std::io;
use std::mem;
use std::path;
use std::process;
use std::thread;

use markov_danaher_quotes::MarkovChain;
use markov_danaher_quotes::Metadata;

fn main() {
  let up_to_markov_num = match env::args().nth(1) {
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

  let input_text = match env::args().nth(2) {
    Some(v) => match fs::read_to_string(path::Path::new(&v)) {
      Ok(v) => v,
      Err(e) => {
        eprintln!("failed to read input text file from {}:: {}", v, e);
        process::exit(1)
      }
    },
    None => {
      eprintln!("provide a relative file path to the input text as the second argument");
      process::exit(1)
    }
  };

  thread::scope(|s| {
    let text = &input_text;

    s.spawn(move || {
      let metadata = Metadata::new(text);
      println!("{:?}", metadata);

      let output_file_path = "../rsResources/markovMetadata";
      let output_file = fs::File::create(output_file_path).unwrap();
      let w = io::BufWriter::new(output_file);

      ciborium::into_writer(&metadata, w).unwrap();

      // Prevent dropping/deallocating metadata - leak it for the process lifetime
      // the OS will reclaim it on exit
      mem::forget(metadata);
    });

    for markov_num in 1..=up_to_markov_num {
      s.spawn(move || {
        let mc = MarkovChain::new(markov_num, text);

        let output_file_path = format!("../rsResources/markov{}", mc.num);
        let output_file = fs::File::create(output_file_path).unwrap();
        let w = io::BufWriter::new(output_file);

        ciborium::into_writer(&mc, w).unwrap();

        // Prevent dropping/deallocating markov_chains - leak it for the process lifetime
        // the OS will reclaim it on exit
        mem::forget(mc);
      });
    }
  });
}
