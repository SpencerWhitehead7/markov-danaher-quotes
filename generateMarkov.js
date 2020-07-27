const fs = require(`fs`)

const wordEndsSentence = word => word[word.length - 1] === `.` || word[word.length - 1] === `!` || word[word.length - 1] === `?`

const generateFreqTable = num => {
  const words = fs
    .readFileSync(`./postTexts.txt`, `utf8`)
    .replace(/\s+/g, ` `)
    .split(` `)

  const freqTable = {sTaRt5pLzNoCoLl1s1oNs : {}}

  for(let i = num; i < words.length; i++){
    const prev = words.slice(i - num, i).join(` `)
    const word = words[i]

    if(wordEndsSentence(prev)){
      const start = words.slice(i, i + num).join(` `)
      freqTable.sTaRt5pLzNoCoLl1s1oNs[start] = (freqTable.sTaRt5pLzNoCoLl1s1oNs[start] || 0) + 1
    }

    if(!freqTable[prev]){
      freqTable[prev] = {[word] : 1}
    }else{
      freqTable[prev][word] = (freqTable[prev][word] || 0) + 1
    }
  }

  return freqTable
}

const freqToMarkov = freqTable => {
  Object.values(freqTable).forEach(rootWord => {
    const nextWords = Object.keys(rootWord)
    const endWords = nextWords.filter(wordEndsSentence)

    if(endWords.length > 0){
      rootWord.eNd5pLzNoCoL11s1oNs = {}
      const sum = endWords.reduce((acc, curr) => acc + rootWord[curr], 0)
      let lowerBound = 0
      endWords.forEach(endWord => {
        const upperBound = lowerBound + (rootWord[endWord] / sum)
        rootWord.eNd5pLzNoCoL11s1oNs[endWord] = [lowerBound, upperBound]
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

const generateMarkov = markovNum => freqToMarkov(generateFreqTable(markovNum))

const saveMarkovs = upToMarkovNum => {
  for(let i = 1; i <= upToMarkovNum; i++){
    const markov = JSON.stringify(generateMarkov(i))
    fs.writeFileSync(`markov${i}.json`, markov, `utf8`)
  }
}

saveMarkovs(5)
