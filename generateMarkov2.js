const fs = require(`fs`)

const text = fs.readFileSync(`./cleanDanaherPosts.txt`, `utf8`)

const generateFreqTable2 = () => {
  const arr = text.split(` `)
  const freqTable = {
    endsPlzNoCollisions : {},
    startsPlzNoCollisions : {},
  }
  for(let i=2; i<arr.length; i++){
    const prev = arr.slice(i-2, i).join(` `)
    const word = arr[i]
    if(word[word.length-1] === `.` || word[word.length-1] === `!` || word[word.length-1] === `?`){
      if(!freqTable.endsPlzNoCollisions[word]){
        freqTable.endsPlzNoCollisions[word] = 1
      }else{
        freqTable.endsPlzNoCollisions[word]++
      }
    }
    if(prev[prev.length-1] === `.` || prev[prev.length-1] === `!` || prev[prev.length-1] === `?`){
      const startWords = arr.slice(i, i+2).join(` `)
      if(!freqTable.startsPlzNoCollisions[startWords]){
        freqTable.startsPlzNoCollisions[startWords] = 1
      }else{
        freqTable.startsPlzNoCollisions[startWords]++
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
  const freqtable = generateFreqTable2()
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

const generateQuote = num => {
  const res = pickNextWord(markov.startsPlzNoCollisions).split(` `)
  for(let i=2; i<num-2; i++){
    res.push(...pickNextWord(markov[res.slice(-2).join(` `)]).split(` `))
  }
  return res.join(` `)
}

const quote = generateQuote(200)

console.log(quote)
