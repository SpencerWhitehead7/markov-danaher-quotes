const fs = require(`fs`)

const markovNum = 3

const markov = JSON.parse(fs.readFileSync(`./markov${markovNum}.txt`))

const pickNextWord = prev => {
  const selector = Math.random()
  const nextWords = Object.keys(prev)
  for(let i=0; i<nextWords.length; i++){
    if(selector >= prev[nextWords[i]][0] && selector < prev[nextWords[i]][1]) return nextWords[i]
  }
  return ``
}

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

const generateSentence = prev => {
  const res = prev ? prev : pickNextWord(markov.startsPlzNoCollisions).split(` `)
  const length = 25 + Math.round(Math.random() * 10)
  for(let i=markovNum; i<length-1; i++){
    res.push(pickNextWord(markov[res.slice(-markovNum).join(` `)]))
  }
  while(res[res.length-1][res[res.length-1].length-1] !== `.` &&
  res[res.length-1][res[res.length-1].length-1] !== `!` &&
  res[res.length-1][res[res.length-1].length-1] !== `?`){
    res.push(endSentence(markov[res.slice(-markovNum).join(` `)]))
  }
  return prev ? res.slice(3).join(` `) : res.join(` `)
}

const generateQuoteBySentences = length => {
  let count = 1
  const sentences = [generateSentence()]
  while(count < length){
    const prev = sentences[sentences.length-1].split(` `).slice(-markovNum)
    sentences.push(generateSentence(prev))
    count++
  }
  return sentences.join(` `)
}

const generateQuoteByWords = length => {
  const res = pickNextWord(markov.startsPlzNoCollisions).split(` `)
  for(let i=markovNum; i<length; i++){
    res.push(pickNextWord(markov[res.slice(-markovNum).join(` `)]))
  }
  return res.join(` `)
}

const quote = generateQuoteBySentences(2)

console.log(quote)
