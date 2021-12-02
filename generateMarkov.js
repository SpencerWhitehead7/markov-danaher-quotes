const fs = require(`fs`)

const words = fs
  .readFileSync(`./postTexts.txt`, `utf8`)
  .replace(/\s+/g, ` `)
  .split(` `)

const isEndOfSentence = word =>
  word[word.length - 1] === `.` ||
  word[word.length - 1] === `!` ||
  word[word.length - 1] === `?`

const wordsToFreqTable = markovNum => {
  const BEGIN = {
    QUOTE: {
      [words.slice(0, markovNum).join(` `)]: 1,
    },
  }
  const MIDDLE = {}
  const END = {}

  for (let i = markovNum; i < words.length; i++) {
    const prev = words.slice(i - markovNum, i).join(` `)
    const word = words[i]

    if (isEndOfSentence(word)) {
      if (i !== words.length - 1) {
        const nextSentenceStart = words.slice(i + 1, i + 1 + markovNum).join(` `)
        BEGIN.QUOTE[nextSentenceStart] = (BEGIN.QUOTE[nextSentenceStart] || 0) + 1
      }

      if (END[prev]) {
        END[prev][word] = (END[prev][word] || 0) + 1
      } else {
        END[prev] = { [word]: 1 }
      }
    }

    if (MIDDLE[prev]) {
      MIDDLE[prev][word] = (MIDDLE[prev][word] || 0) + 1
    } else {
      MIDDLE[prev] = { [word]: 1 }
    }
  }

  return { BEGIN, MIDDLE, END }
}

const freqTableToMarkov = freqTable => {
  Object.values(freqTable).forEach(root => {
    Object.values(root).forEach(rootWord => {
      const nextWords = Object.keys(rootWord)

      const sum = nextWords.reduce((acc, curr) => acc + rootWord[curr], 0)
      let lowerBound = 0
      nextWords.forEach(nextWord => {
        const upperBound = lowerBound + (rootWord[nextWord] / sum)
        rootWord[nextWord] = [lowerBound, upperBound]
        lowerBound = upperBound
      })
    })
  })
  return freqTable
}

const generateMarkov = markovNum => freqTableToMarkov(wordsToFreqTable(markovNum))

const saveMarkovs = upToMarkovNum => {
  for (let i = 1; i <= upToMarkovNum; i++) {
    fs.writeFileSync(`markov${i}.json`, JSON.stringify(generateMarkov(i)), `utf8`)
  }
}

saveMarkovs(5)
