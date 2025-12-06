use std::env;
use std::fs;
use std::io;
use std::mem;
use std::path;

use markov_danaher_quotes::generate_markovs;

fn main() {
  let up_to_markov_num_input = &env::args().nth(1).unwrap();
  let up_to_markov_num = up_to_markov_num_input.parse::<usize>().unwrap();

  let input_text_file_path_input = &env::args().nth(2).unwrap();
  let input_text_file_path = path::Path::new(input_text_file_path_input);
  let text = fs::read_to_string(input_text_file_path).unwrap();

  let (metadata, markov_chains) = generate_markovs(&text, up_to_markov_num);

  println!("{:?}", metadata);

  ciborium::into_writer(
    &metadata,
    fs::File::create("../rsResources/markovMetadata").unwrap(),
  )
  .unwrap();

  markov_chains.iter().for_each(|mc| {
    let output_file_path = format!("../rsResources/markov{}", mc.num);
    let output_file = fs::File::create(output_file_path).unwrap();
    let w = io::BufWriter::new(output_file);
    ciborium::into_writer(mc, w).unwrap();
  });

  // Prevent dropping/deallocating markov_chains - leak it for the process lifetime
  // the OS will reclaim it on exit
  mem::forget(markov_chains);
}
