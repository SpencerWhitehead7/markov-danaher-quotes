const fs = require(`fs`)

const isEndOfSentence = word =>
  word[word.length - 1] === `.` ||
  word[word.length - 1] === `!` ||
  word[word.length - 1] === `?`

const pickNextWord = wordNode => {
  const selector = Math.random()
  const nextWords = Object.keys(wordNode)
  for (let i = 0; i < nextWords.length; i++) {
    const [lowerBound, upperBound] = wordNode[nextWords[i]]
    if (lowerBound <= selector && selector < upperBound) return nextWords[i]
  }
  return ``
}

const generateQuoteBySentences = quoteSentenceCount => {
  const quote = pickNextWord(BEGIN.QUOTE).split(` `)
  for (let sI = 0; sI < quoteSentenceCount; sI++) {
    for (let wI = 0; wI < sentenceLength - 1; wI++) {
      quote.push(pickNextWord(MIDDLE[quote.slice(-markovNum).join(` `)]))
    }
    while (!isEndOfSentence(quote[quote.length - 1])) {
      const prevPhrase = quote.slice(-markovNum).join(` `)
      quote.push(pickNextWord(END[prevPhrase] ? END[prevPhrase] : MIDDLE[prevPhrase]))
    }
  }
  return quote.join(` `)
}

const generateQuoteByWords = quoteWordCount => {
  const quote = pickNextWord(BEGIN.QUOTE).split(` `)
  for (let i = markovNum; i < quoteWordCount; i++) {
    quote.push(pickNextWord(MIDDLE[quote.slice(-markovNum).join(` `)]))
  }
  return quote.join(` `)
}

const markovNum = process.argv[2]
const markovChainFilePath = `./markov${markovNum}.json`
if (!fs.existsSync(markovChainFilePath)) {
  console.error(`markovNum (first arg) must point to a valid markov chain file: was ${markovNum}`)
  process.exit(9)
}
const { BEGIN, MIDDLE, END } = require(markovChainFilePath)

let quoteLength = process.argv[3]
if (quoteLength === undefined) {
  console.log(`qouteLength (second arg) undefined: defaults to 3`)
  quoteLength = 3
}
quoteLength = Number(quoteLength)

let generationVersion = process.argv[4]
let generationFunction
if (generationVersion === undefined) {
  console.log(`generationMethod (third arg undefined: defaults to "sentence")`)
  generationVersion = "sentence"
}
if (generationVersion === "sentence") {
  generationFunction = generateQuoteBySentences
} else if (generationVersion === "word") {
  generationFunction = generateQuoteByWords
} else {
  console.error(`generationMethod (third arg) must be "sentence" or "word": was ${generationVersion}`)
  process.exit(9)
}

let sentenceLength
if (generationVersion === "sentence") {
  sentenceLength = process.argv[5]
  if (sentenceLength === undefined) {
    console.log(`sentenceLength (fourth arg) undefined: defaults to 17`)
    sentenceLength = 17
  }
  sentenceLength = Number(sentenceLength)
}

console.log(generationFunction(quoteLength))
