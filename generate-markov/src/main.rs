use std::env;
use std::fs;
use std::path;

mod markov;
mod metadata;

fn main() {
  let up_to_markov_num_input = &env::args().nth(1).unwrap();
  let up_to_markov_num = up_to_markov_num_input.parse::<usize>().unwrap();

  let input_text_file_path_input = &env::args().nth(2).unwrap();
  let input_text_file_path = path::Path::new(input_text_file_path_input);
  let text = fs::read_to_string(input_text_file_path).unwrap();

  markov::generate(&text, up_to_markov_num);
  metadata::generate(&text);
}
