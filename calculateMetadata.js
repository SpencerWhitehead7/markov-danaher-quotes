const fs = require(`fs`)

const text = fs.readFileSync(`cleanDanaherPosts.txt`, `utf8`)

const mostSentences = text.split(`.`)

const allSentences = []

mostSentences.forEach(sentence => {
  if(sentence.includes(`!`)){
    allSentences.push(...sentence.split(`!`))
  }else if(sentence.includes(`?`)){
    allSentences.push(...sentence.split(`?`))
  }else{
    allSentences.push(sentence)
  }
})

let totalWords = 0

allSentences.forEach(sentence => {
  totalWords += sentence.split(` `).length
})

console.log(totalWords/allSentences.length)
