const fs = require(`fs`)

const sentences = fs
  .readFileSync(`postTexts.txt`, `utf8`)
  .replace(/\s+/g, ` `)
  .split(/[.!?]+/)

const words = sentences.flatMap(sentence => sentence.split(` `))

const metadata = {
  wordCount: words.length,
  sentenceCount: sentences.length,
  wordsPerSentence: words.length / sentences.length,
}

console.log(metadata)

fs.writeFileSync(`markovMetadata.json`, JSON.stringify(metadata), `utf8`)
