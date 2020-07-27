const fs = require(`fs`)

const allSentences = fs
  .readFileSync(`postTexts.txt`, `utf8`)
  .replace(/\s+/g, ` `)
  .split(/[.!?]+/)

const totalWords = allSentences.reduce((words, sentence) => words + sentence.split(` `).length, 0)

console.log(totalWords / allSentences.length)
