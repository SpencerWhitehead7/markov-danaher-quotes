use std::collections::HashMap;

use lambda_runtime;
use lazy_static;
use log;
use rand;
use serde;
use simple_logger;

type WordNode = HashMap<String, [f32; 2]>;
type MarkovChain = HashMap<String, HashMap<String, WordNode>>;

#[derive(serde::Deserialize)]
struct Request {}

#[derive(serde::Serialize)]
struct Response {
  quote: String,
}

lazy_static::lazy_static! {
  static ref MARKOV: MarkovChain =
    serde_cbor::from_slice(include_bytes!("../../rsResources/markov3")).unwrap();
}

const MARKOV_NUM: usize = 3;

#[tokio::main]
async fn main() -> Result<(), lambda_runtime::Error> {
  simple_logger::SimpleLogger::new()
    .with_level(log::LevelFilter::Info)
    .init()
    .unwrap();

  let func = lambda_runtime::handler_fn(generate_quote);
  lambda_runtime::run(func).await?;
  Ok(())
}

pub(crate) async fn generate_quote(
  _: Request,
  _: lambda_runtime::Context,
) -> Result<Response, lambda_runtime::Error> {
  let mut quote = pick_next_word(MARKOV.get("BEGIN").unwrap().get("QUOTE").unwrap())
    .split(' ')
    .collect::<Vec<&str>>();
  for _ in 0..9 {
    for _ in 0..23 - 1 {
      quote.push(pick_next_word(
        MARKOV
          .get("MIDDLE")
          .unwrap()
          .get(&quote[quote.len() - MARKOV_NUM..quote.len()].join(" "))
          .unwrap(),
      ))
    }
    while !is_end_of_sentence(quote.last().unwrap()) {
      let prev_phrase = &quote[quote.len() - MARKOV_NUM..quote.len()].join(" ");
      let word_node = match MARKOV.get("END").unwrap().get(prev_phrase) {
        Some(node) => node,
        None => MARKOV.get("MIDDLE").unwrap().get(prev_phrase).unwrap(),
      };
      quote.push(pick_next_word(word_node))
    }
  }

  Ok(Response {
    quote: quote.join(" "),
  })
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

fn is_end_of_sentence(word: &str) -> bool {
  let last_letter = match word.chars().last() {
    Some(letter) => letter,
    None => return false,
  };

  last_letter == '.' || last_letter == '!' || last_letter == '?'
}
