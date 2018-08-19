const fs = require(`fs`)

const text = fs.readFileSync(`./danaherPosts.txt`, `utf8`)

const generateFreqTable = () => {
  const arr = text.split(` `)
  const freqTable = {
    endsPlzNoCollisions : {},
    startsPlzNoCollisions : {},
  }
  for(let i=1; i<arr.length; i++){
    const prevWord = arr[i-1]
    const word = arr[i]
    if(word[word.length-1] === `.` || word[word.length-1] === `!` || word[word.length-1] === `?`){
      if(!freqTable.endsPlzNoCollisions[word]){
        freqTable.endsPlzNoCollisions[word] = 1
      }else{
        freqTable.endsPlzNoCollisions[word]++
      }
    }
    if(prevWord[prevWord.length-1] === `.` || prevWord[prevWord.length-1] === `!` || prevWord[prevWord.length-1] === `?`){
      if(!freqTable.startsPlzNoCollisions[word]){
        freqTable.startsPlzNoCollisions[word] = 1
      }else{
        freqTable.startsPlzNoCollisions[word]++
      }
    }
    if(!freqTable[prevWord]){
      freqTable[prevWord] = {[word] : 1}
    }else if(!freqTable[prevWord][word]){
      freqTable[prevWord][word] = 1
    }else{
      freqTable[prevWord][word]++
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
