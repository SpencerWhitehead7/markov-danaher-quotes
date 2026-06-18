use std::fs;
use std::io;

use markov_danaher_quotes::MarkovChain;

fn main() {
  divan::main();
}

#[divan::bench]
fn generate_markov(bencher: divan::Bencher) {
  let text = fs::read_to_string("../input.txt").unwrap();

  bencher.bench_local(move || {
    MarkovChain::new(3, &text);
  });
}

#[divan::bench]
fn generate_quote(bencher: divan::Bencher) {
  let markov_path = "../rsResources/markov3";
  let markov_file = fs::File::open(markov_path).unwrap();
  let markov_reader = io::BufReader::new(markov_file);
  let markov: MarkovChain = ciborium::from_reader(markov_reader).unwrap();

  bencher.bench_local(move || {
    markov.generate_quote_by_sentences(1000);
  });
}
