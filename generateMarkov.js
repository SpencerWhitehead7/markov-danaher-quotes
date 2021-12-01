const fs = require(`fs`)

const { STARTS, ENDS } = require(`./constants`)

const words = fs
  .readFileSync(`./postTexts.txt`, `utf8`)
  .replace(/\s+/g, ` `)
  .split(` `)

const isEndOfSentence = word =>
  word[word.length - 1] === `.` ||
  word[word.length - 1] === `!` ||
  word[word.length - 1] === `?`

const wordsToFreqTable = markovNum => {
  const freqTable = { [STARTS]: {} }

  for (let i = markovNum; i < words.length; i++) {
    const prev = words.slice(i - markovNum, i).join(` `)
    const word = words[i]

    if (isEndOfSentence(prev)) {
      const start = words.slice(i, i + markovNum).join(` `)
      freqTable[STARTS][start] = (freqTable[STARTS][start] || 0) + 1
    }

    if (freqTable[prev]) {
      freqTable[prev][word] = (freqTable[prev][word] || 0) + 1
    } else {
      freqTable[prev] = { [word]: 1 }
    }
  }

  return freqTable
}

const freqTableToMarkov = freqTable => {
  Object.values(freqTable).forEach(rootWord => {
    const nextWords = Object.keys(rootWord)
    const endWords = nextWords.filter(isEndOfSentence)

    if (endWords.length > 0) {
      rootWord[ENDS] = {}
      const sum = endWords.reduce((acc, curr) => acc + rootWord[curr], 0)
      let lowerBound = 0
      endWords.forEach(endWord => {
        const upperBound = lowerBound + (rootWord[endWord] / sum)
        rootWord[ENDS][endWord] = [lowerBound, upperBound]
        lowerBound = upperBound
      })
    }

    const sum = nextWords.reduce((acc, curr) => acc + rootWord[curr], 0)
    let lowerBound = 0
    nextWords.forEach(nextWord => {
      const upperBound = lowerBound + (rootWord[nextWord] / sum)
      rootWord[nextWord] = [lowerBound, upperBound]
      lowerBound = upperBound
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
