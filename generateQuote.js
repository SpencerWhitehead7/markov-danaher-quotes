const fs = require(`fs`)

const markov = JSON.parse(fs.readFileSync(`./markov3.txt`))

const pickNextWord = prev => {
  const selector = Math.random()
  const nextWords = Object.keys(prev)
  for(let i=0; i<nextWords.length; i++){
    if(selector >= prev[nextWords[i]][0] && selector < prev[nextWords[i]][1]) return nextWords[i]
  }
  return ``
}

const generateQuote = (length, markovNum) => {
  const res = pickNextWord(markov.startsPlzNoCollisions).split(` `)
  for(let i=markovNum; i<length; i++){
    res.push(pickNextWord(markov[res.slice(-markovNum).join(` `)]))
  }
  return res.join(` `)
}

const quote = generateQuote(200, 3)

// console.log(quote)

const endSentence = prev => {
  const nextWords = Object.keys(prev).filter(word => {
    return (word[word.length-1] === `.` ||
    word[word.length-1] === `!` ||
    word[word.length-1] === `?`)
  })
  if(nextWords.length === 0){
    return pickNextWord(prev)
  }else{
    const endWords = {}
    let sum = 0
    nextWords.forEach(word => {
      const wordProb = prev[word][1] - prev[word][0]
      endWords[word] = wordProb
      sum += wordProb
    })
    let lowerBound = 0
    nextWords.forEach(word => {
      const upperBound = lowerBound + endWords[word]/sum
      endWords[word] = [lowerBound, upperBound]
      lowerBound = upperBound
    })
    const selector = Math.random()
    for(let i=0; i<nextWords.length; i++){
      if(selector >= endWords[nextWords[i]][0] && selector < endWords[nextWords[i]][1]) return nextWords[i]
    }
    return ``
  }
}

const generateSentence = (markovNum, prev) => {
  const res = prev ? pickNextWord(markov[prev]).split(` `) : pickNextWord(markov.startsPlzNoCollisions).split(` `)
  const length = 25 + Math.round(Math.random() * 10)
  for(let i=markovNum; i<length-1; i++){
    res.push(pickNextWord(markov[res.slice(-markovNum).join(` `)]))
  }
  while(res[res.length-1][res[res.length-1].length-1] !== `.` &&
  res[res.length-1][res[res.length-1].length-1] !== `!` &&
  res[res.length-1][res[res.length-1].length-1] !== `?`){
    res.push(endSentence(markov[res.slice(-markovNum).join(` `)]))
  }
  return res.join(` `)
}

console.log(generateSentence(3))
