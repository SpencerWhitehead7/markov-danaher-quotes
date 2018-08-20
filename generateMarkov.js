const fs = require(`fs`)

const text = fs.readFileSync(`./cleanDanaherPosts.txt`, `utf8`)

const generateFreqTable = num => {
  const arr = text.split(` `)
  const freqTable = {sTaRt5pLzNoCoLl1s1oNs : {}}

  for(let i=num; i<arr.length; i++){
    const prev = arr.slice(i-num, i).join(` `)
    const word = arr[i]
    
    if(prev[prev.length-1] === `.` || prev[prev.length-1] === `!` || prev[prev.length-1] === `?`){
      const start = arr.slice(i, i+num).join(` `)
      if(!freqTable.sTaRt5pLzNoCoLl1s1oNs[start]){
        freqTable.sTaRt5pLzNoCoLl1s1oNs[start] = 1
      }else{
        freqTable.sTaRt5pLzNoCoLl1s1oNs[start]++
      }
    }
    
    if(!freqTable[prev]){
      freqTable[prev] = {[word] : 1}
    }else if(!freqTable[prev][word]){
      freqTable[prev][word] = 1
    }else{
      freqTable[prev][word]++
    }
  }

  return freqTable
}

const freqToMarkov = freqTable => {
  Object.keys(freqTable).forEach(word => {
    const rootWord = freqTable[word]
    const nextWords = Object.keys(rootWord)
    const endWords = nextWords.filter(nextWord => {
      const lastChar = nextWord[nextWord.length-1]
      return lastChar === `.` || lastChar === `!` || lastChar === `?`
    })

    if(endWords.length > 0){
      rootWord.eNd5pLzNoCoLiSi0nS = {}
      const sum = endWords.reduce((acc, curr) => acc + rootWord[curr], 0)
      let lowerBound = 0
      endWords.forEach(endWord => {
        const upperBound = lowerBound + rootWord[endWord]/sum
        rootWord.eNd5pLzNoCoLiSi0nS[endWord] = [lowerBound, upperBound]
        lowerBound = upperBound
      })
    }

    const sum = nextWords.reduce((acc, curr) => acc + rootWord[curr], 0)
    let lowerBound = 0
    nextWords.forEach(nextWord => {
      const upperBound = lowerBound + rootWord[nextWord]/sum
      rootWord[nextWord] = [lowerBound, upperBound]
      lowerBound = upperBound
    })
  })

  return freqTable
}

const generateMarkov = markovNum => {
  return freqToMarkov(generateFreqTable(markovNum))
}

const saveMarkovs = upToMarkovNum => {
  for(let i=1; i<=upToMarkovNum; i++){
    const markov = JSON.stringify(generateMarkov(i))
    fs.writeFileSync(`markov${i}.txt`, markov, `utf8`)    
  }
}

saveMarkovs(5)
