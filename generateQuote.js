const markovNum = process.argv[2]
const markov = require(`./markov${markovNum}.json`)

const { STARTS, ENDS } = require('./constants')

const isEndOfSentence = word =>
  word[word.length - 1] === `.` ||
  word[word.length - 1] === `!` ||
  word[word.length - 1] === `?`

const pickNextWord = wordNode => {
  const selector = Math.random()
  const nextWords = Object.keys(wordNode).filter(key => key !== ENDS)
  for (let i = 0; i < nextWords.length; i++) {
    const [lowerBound, upperBound] = wordNode[nextWords[i]]
    if (lowerBound <= selector && selector < upperBound) return nextWords[i]
  }
  return ``
}

const generateQuoteBySentences = quoteSentenceCount => {
  const quote = pickNextWord(markov[STARTS]).split(` `)
  for (let sI = 0; sI < quoteSentenceCount; sI++) {
    for (let wI = 0; wI < 24; wI++) {
      quote.push(pickNextWord(markov[quote.slice(-markovNum).join(` `)]))
    }
    while (!isEndOfSentence(quote[quote.length - 1])) {
      const prevWordNode = markov[quote.slice(-markovNum).join(` `)]
      quote.push(pickNextWord(prevWordNode[ENDS] ? prevWordNode[ENDS] : prevWordNode))
    }
  }
  return quote.join(` `)
}

const generateQuoteByWords = quoteWordCount => {
  const quote = pickNextWord(markov[STARTS]).split(` `)
  for (let i = markovNum; i < quoteWordCount; i++) {
    quote.push(pickNextWord(markov[quote.slice(-markovNum).join(` `)]))
  }
  return quote.join(` `)
}

console.log(generateQuoteBySentences(2))
