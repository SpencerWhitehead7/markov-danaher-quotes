use std::collections::HashMap;
use std::fs;
use std::thread;

fn is_end_of_sentence(word: &str) -> bool {
  let last_letter = match word.chars().last() {
    Some(letter) => letter,
    None => return false,
  };

  last_letter == '.' || last_letter == '!' || last_letter == '?'
}

type FreqTableLeaf = f32;
type FreqTableBranch = HashMap<String, FreqTableLeaf>;
type FreqTableTrunk = HashMap<String, FreqTableBranch>;
type FreqTable = HashMap<String, FreqTableTrunk>;
fn words_to_freq_table(text: &str, markov_num: usize) -> FreqTable {
  let words: Vec<&str> = text.split_whitespace().collect();

  let mut begin = FreqTableTrunk::from([(
    "QUOTE".to_string(),
    HashMap::from([(words[0..markov_num].join(" "), 1.0)]),
  )]);
  let mut middle = FreqTableTrunk::new();
  let mut end = FreqTableTrunk::new();

  for i in markov_num..words.len() {
    let prev = words[i - markov_num..i].join(" ");
    let word = words[i];

    if is_end_of_sentence(&word) {
      if i != words.len() - 1 {
        let next_sentence_start = words[i + 1..i + 1 + markov_num].join(" ");
        *begin
          .entry("QUOTE".to_string())
          .or_insert(HashMap::new())
          .entry(next_sentence_start)
          .or_insert(0.0) += 1.0;
      }

      *end
        .entry(prev.to_string())
        .or_insert(HashMap::new())
        .entry(word.to_string())
        .or_insert(0.0) += 1.0;
    }

    *middle
      .entry(prev.to_string())
      .or_insert(HashMap::new())
      .entry(word.to_string())
      .or_insert(0.0) += 1.0;
  }

  HashMap::from([
    ("BEGIN".to_string(), begin),
    ("MIDDLE".to_string(), middle),
    ("END".to_string(), end),
  ])
}

type MarkovChainLeaf = [f32; 2];
type MarkovChainBranch = HashMap<String, MarkovChainLeaf>;
type MarkovChainTrunk = HashMap<String, MarkovChainBranch>;
pub type MarkovChain = HashMap<String, MarkovChainTrunk>;
fn freq_table_to_markov(freq_table: FreqTable) -> MarkovChain {
  let mut markov: MarkovChain = HashMap::new();

  for (root, nexts) in freq_table {
    let mut markov_nexts = MarkovChainTrunk::new();
    for (root_word, next_words) in nexts {
      let sum = next_words.values().fold(0.0, |acc, curr| acc + curr);
      let mut lower_bound = 0.0;
      markov_nexts.insert(
        root_word,
        next_words
          .keys()
          .fold(MarkovChainBranch::new(), |mut acc, curr| {
            let upper_bound = lower_bound + (next_words[curr] / sum);
            acc.insert(curr.to_string(), [lower_bound, upper_bound]);
            lower_bound = upper_bound;
            acc
          }),
      );
    }
    markov.insert(root, markov_nexts);
  }
  markov
}

fn generate_metadata(text: &str) -> HashMap<&str, usize> {
  let word_count = text.split_whitespace().count();
  let sentence_count = text.split(&['.', '!', '?'][..]).count();

  HashMap::from([
    ("wordCount", word_count),
    ("sentenceCount", sentence_count),
    ("wordsPerSentence", word_count / sentence_count),
  ])
}

pub fn generate_markovs(text: &str, max_markov_num: usize) {
  let local_text = text.to_string();
  let mut children = vec![thread::spawn(move || {
    let metadata = generate_metadata(&local_text);

    println!("{:?}", metadata);

    ciborium::into_writer(
      &metadata,
      fs::File::create("../rsResources/markovMetadata").unwrap(),
    )
    .unwrap()
  })];

  for markov_num in 1..=max_markov_num {
    let local_text = text.to_string();

    children.push(thread::spawn(move || {
      ciborium::into_writer(
        &freq_table_to_markov(words_to_freq_table(&local_text, markov_num)),
        fs::File::create(format!("../rsResources/markov{}", markov_num)).unwrap(),
      )
      .unwrap();
    }))
  }

  for child in children {
    child.join().unwrap()
  }
}

fn pick_next_word(word_node: &MarkovChainBranch) -> &str {
  let selector = &rand::random::<f32>();
  for (next_word, [lower_bound, upper_bound]) in word_node {
    if lower_bound <= selector && selector < upper_bound {
      return next_word;
    }
  }
  ""
}

pub fn generate_quote_by_sentences(
  markov: &MarkovChain,
  markov_num: usize,
  sentence_count: usize,
) -> String {
  let mut quote = pick_next_word(markov.get("BEGIN").unwrap().get("QUOTE").unwrap())
    .split(' ')
    .collect::<Vec<&str>>();
  for _ in 0..sentence_count {
    // default length of sentence
    for _ in 0..17 - 1 {
      quote.push(pick_next_word(
        markov
          .get("MIDDLE")
          .unwrap()
          .get(&quote[quote.len() - markov_num..quote.len()].join(" "))
          .unwrap(),
      ))
    }
    while !is_end_of_sentence(quote.last().unwrap()) {
      let prev_phrase = &quote[quote.len() - markov_num..quote.len()].join(" ");
      let word_node = match markov.get("END").unwrap().get(prev_phrase) {
        Some(node) => node,
        None => markov.get("MIDDLE").unwrap().get(prev_phrase).unwrap(),
      };
      quote.push(pick_next_word(word_node))
    }
  }
  quote.join(" ")
}

pub fn generate_quote_by_words(
  markov: &MarkovChain,
  markov_num: usize,
  word_count: usize,
) -> String {
  let mut quote = pick_next_word(markov.get("BEGIN").unwrap().get("QUOTE").unwrap())
    .split(' ')
    .collect::<Vec<&str>>();
  for _ in markov_num..word_count {
    quote.push(pick_next_word(
      markov
        .get("MIDDLE")
        .unwrap()
        .get(&quote[quote.len() - markov_num..quote.len()].join(" "))
        .unwrap(),
    ))
  }
  quote.join(" ")
}
