const fs = require(`fs`)

const text = fs.readFileSync(`./cleanDanaherPosts.txt`, `utf8`)

const generateFreqTable = () => {
  const arr = text.split(` `)
  const freqTable = {
    endsPlzNoCollisions : {},
    startsPlzNoCollisions : {},
  }
  for(let i=1; i<arr.length; i++){
    const prev = arr[i-1]
    const word = arr[i]
    if(word[word.length-1] === `.` || word[word.length-1] === `!` || word[word.length-1] === `?`){
      if(!freqTable.endsPlzNoCollisions[word]){
        freqTable.endsPlzNoCollisions[word] = 1
      }else{
        freqTable.endsPlzNoCollisions[word]++
      }
    }
    if(prev[prev.length-1] === `.` || prev[prev.length-1] === `!` || prev[prev.length-1] === `?`){
      if(!freqTable.startsPlzNoCollisions[word]){
        freqTable.startsPlzNoCollisions[word] = 1
      }else{
        freqTable.startsPlzNoCollisions[word]++
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
  const words = Object.keys(freqTable)
  words.forEach(word => {
    const nextWords = Object.keys(freqTable[word])
    let sum = 0
    nextWords.forEach(nextWord => {
      sum += freqTable[word][nextWord]
    })
    let lowerBound = 0
    nextWords.forEach(nextWord => {
      const upperBound = lowerBound + freqTable[word][nextWord]/sum
      freqTable[word][nextWord] = [lowerBound, upperBound]
      lowerBound = upperBound
    })
  })
  return freqTable
}

const generateMarkov = () => {
  const freqtable = generateFreqTable()
  return freqToMarkov(freqtable)
}

const markov = generateMarkov()

const pickNextWord = prev => {
  const selector = Math.random()
  const nextWords = Object.keys(prev)
  for(let i=0; i<nextWords.length; i++){
    if(selector >= prev[nextWords[i]][0] && selector < prev[nextWords[i]][1]) return nextWords[i]
  }
  return ``
}

const generateQuote = (markov, num) => {
  const res = [pickNextWord(markov.startsPlzNoCollisions)]
  for(let i=1; i<num-1; i++){
    res.push(pickNextWord(markov[res[i-1]]))
  }
  return res.join(` `)
}

const quote = generateQuote(markov, 200)

console.log(quote)
