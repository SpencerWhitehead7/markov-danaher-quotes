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
    let multiplier = 0
    nextWords.forEach(nextWord => {
      freqTable[word][nextWord] /= sum
      if(freqTable[word][nextWord] > multiplier) multiplier = freqTable[word][nextWord]
    })
    freqTable[word].selectionArr = nextWords.sort((a, b) => freqTable[word][a] - freqTable[word][b])
    freqTable[word].multiplier = multiplier
  })
  return freqTable
}

const generateMarkov = () => {
  const freqtable = generateFreqTable2()
  return freqToMarkov(freqtable)
}

const markov = generateMarkov()

const pickNextWord = prev => {
  const selector = Math.random() * prev.multiplier
  const possibleNextWords = prev.selectionArr
  for(let i=0; i<possibleNextWords.length; i++){
    if(selector <= prev[possibleNextWords[i]]){
      return possibleNextWords[i]
    }
  }
  return ``
}

const generateQuote = (markov, num) => {
  const res = pickNextWord(markov.startsPlzNoCollisions).split(` `)
  for(let i=1; i<num-1; i++){
    res.push(...pickNextWord(markov[res.slice(-2).join(` `)]).split(` `))
  }
  return res.join(` `)
}

const quote = generateQuote(markov, 200)

console.log(quote)
