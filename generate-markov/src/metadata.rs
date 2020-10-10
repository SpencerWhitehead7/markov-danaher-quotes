use std::collections::HashMap;
use std::fs;

use serde_cbor;

pub fn generate(text: &str) {
  let total_words = text.split_whitespace().count() as f32;
  let total_sentences = text.split(&['.', '!', '?'][..]).count() as f32;

  let metadata = HashMap::from([
    ("wordCount", total_words),
    ("sentenceCount", total_sentences),
    ("wordsPerSentence", total_words / total_sentences),
  ]);

  println!("{:?}", metadata);
  serde_cbor::to_writer(
    fs::File::create("rsResources/markovMetadata").unwrap(),
    &metadata,
  )
  .unwrap();
}
