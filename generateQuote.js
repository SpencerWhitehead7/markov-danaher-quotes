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
    res.push(...pickNextWord(markov[res.slice(-markovNum).join(` `)]).split(` `))
  }
  return res.join(` `)
}

const quote = generateQuote(200, 3)

console.log(quote)

// // Even I don't even know what I'm thinking here
// const endSentence = prev => {
//   selector = Math.random()
//   const nextWords = Object.keys(prev).filter(word => {
//     return (word[word.length -1] === `.` ||
//     word[word.length -1] === `!` ||
//     word[word.length -1] === `?`)
//   })
//   if(nextWords.length === 0){
//     pickNextWord(prev)
//   }
// }

// const generateSentence = (markovNum, prev) => {
//   const res = prev ? pickNextWord(markov[prev]).split(` `) : pickNextWord(markov.startsPlzNoCollisions).split(` `)
//   const length = 25 + Math.round(Math.random() * (Math.random() > .5 ? 10 : -10))
//   for(let i=markovNum; i<length; i+=markovNum){
//     res.push(...pickNextWord(markov[res.slice(-markovNum).join(` `)]).split(` `))
//   }
//   return res.join(` `)
// }
