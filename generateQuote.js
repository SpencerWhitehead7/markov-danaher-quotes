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
  for(let i=markovNum; i<length-markovNum; i++){
    res.push(...pickNextWord(markov[res.slice(-markovNum).join(` `)]).split(` `))
  }
  return res.join(` `)
}

const quote = generateQuote(200, 3)

console.log(quote)
