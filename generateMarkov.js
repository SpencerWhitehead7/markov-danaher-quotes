const fs = require(`fs`)

const text = fs.readFileSync(`./cleanDanaherPosts.txt`, `utf8`)

const generateFreqTable = num => {
  const arr = text.split(` `)
  const freqTable = {
    endsPlzNoCollisions : {},
    startsPlzNoCollisions : {},
  }
  for(let i=num; i<arr.length; i++){
    const prev = arr.slice(i-num, i).join(` `)
    const word = arr[i]
    if(word[word.length-1] === `.` || word[word.length-1] === `!` || word[word.length-1] === `?`){
      if(!freqTable.endsPlzNoCollisions[word]){
        freqTable.endsPlzNoCollisions[word] = 1
      }else{
        freqTable.endsPlzNoCollisions[word]++
      }
    }
    if(prev[prev.length-1] === `.` || prev[prev.length-1] === `!` || prev[prev.length-1] === `?`){
      const startWord = arr.slice(i, i+num).join(` `)
      if(!freqTable.startsPlzNoCollisions[startWord]){
        freqTable.startsPlzNoCollisions[startWord] = 1
      }else{
        freqTable.startsPlzNoCollisions[startWord]++
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
    const sum = nextWords.reduce((acc, curr) => acc + freqTable[word][curr], 0)
    let lowerBound = 0
    nextWords.forEach(nextWord => {
      const upperBound = lowerBound + freqTable[word][nextWord]/sum
      freqTable[word][nextWord] = [lowerBound, upperBound]
      lowerBound = upperBound
    })
  })
  return freqTable
}

const generateMarkov = markovNum => {
  const freqtable = generateFreqTable(markovNum)
  return freqToMarkov(freqtable)
}

const saveMarkovs = upToMarkovNum => {
  for(let i=1; i<=upToMarkovNum; i++){
    const markov = JSON.stringify(generateMarkov(i))
    fs.writeFileSync(`markov${i}.txt`, markov, `utf8`)    
  }
}

saveMarkovs(5)
