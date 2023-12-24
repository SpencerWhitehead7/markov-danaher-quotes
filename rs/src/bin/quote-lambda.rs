use lambda_runtime;
use lazy_static;
use serde;

use markov_danaher_quotes::MarkovChain;

#[derive(serde::Deserialize)]
struct Request {
  sentence_count: Option<usize>,
}

#[derive(serde::Serialize)]
struct Response {
  quote: String,
}

lazy_static::lazy_static! {
  static ref MARKOV: MarkovChain =
    ciborium::from_reader(include_bytes!("../../../rsResources/markov3") as &[u8]).unwrap();
}

const DEFAULT_SENTENCE_COUNT: usize = 10;

#[tokio::main]
async fn main() -> Result<(), lambda_runtime::Error> {
  let func = lambda_runtime::service_fn(func);
  lambda_runtime::run(func).await?;
  Ok(())
}

async fn func(
  event: lambda_runtime::LambdaEvent<Request>,
) -> Result<Response, lambda_runtime::Error> {
  let (event, _context) = event.into_parts();
  let sentence_count = event
    .sentence_count
    .unwrap_or(DEFAULT_SENTENCE_COUNT)
    .clamp(1, 100);
  let quote = MARKOV.generate_quote_by_sentences(sentence_count);

  Ok(Response { quote })
}
