const fs = require(`fs`)

const isEndOfSentence = word =>
  word.at(-1) === `.` ||
  word.at(-1) === `!` ||
  word.at(-1) === `?`

const newMarkov = (markovNum, words) => {
  const BEGIN = [words.slice(0, markovNum).join(` `)]
  const MIDDLE = {}
  const END = {}

  for (let i = markovNum; i < words.length; i++) {
    const prev = words.slice(i - markovNum, i).join(` `)
    const word = words[i]

    if (isEndOfSentence(word)) {
      if (i !== words.length - 1) {
        BEGIN.push(words.slice(i + 1, i + 1 + markovNum).join(` `))
      }

      END[prev] ??= []
      END[prev].push(word)
    }

    MIDDLE[prev] ??= []
    MIDDLE[prev].push(word)
  }

  return { BEGIN, MIDDLE, END }
}

const upToMarkovNum = process.argv[2]
if (upToMarkovNum < 1 || upToMarkovNum > 10) {
  console.error(`upToMarkovNum (first arg) must be a number between 1 and 10: was ${upToMarkovNum}`)
  process.exit(9)
}

const inputFilepath = process.argv[3]
if (!fs.existsSync(inputFilepath)) {
  console.error(`inputFilepath (second arg) must be a valid path to utf8 file: was ${inputFilepath}`)
  process.exit(9)
}

const text = fs.readFileSync(inputFilepath, `utf8`)
const words = text.split(/\s+/)
const sentences = text.split(/[.!?]+/)

const metadata = {
  wordCount: words.length,
  sentenceCount: sentences.length,
  wordsPerSentence: words.length / sentences.length,
}
console.log(metadata)
const filepath = `../jsResources/markovMetadata.json`
fs.writeFileSync(filepath, JSON.stringify(metadata), `utf8`)

for (let i = 1; i <= upToMarkovNum; i++) {
  const markov = newMarkov(i, words)
  const filepath = `../jsResources/markov${i}.json`
  fs.writeFileSync(filepath, JSON.stringify(markov), `utf8`)
}
