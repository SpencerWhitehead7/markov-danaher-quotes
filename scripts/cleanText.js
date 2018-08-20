const fs = require(`fs`)

let text = fs.readFileSync(`./danaherPosts.txt`, `utf8`)

// strip special chars
text = text.replace(/[^\w\s.!?',/@&\-']|_/gi, ``)

// replace all sentence markers with marker plus space to split accidentally merged words
text = text.replace(/\./g, `. `).replace(/\!/g, `! `).replace(/\?/g, `? `)

// replace all newlines with spaces
text = text.replace(/[\r\n]+/g,` `)

// replace all multiple spaces with single spaces
text = text.replace(/\s\s+/g, ` `)

const arr = text.split(` `)

const newArr = []

arr.forEach(word => {
  if(word.length > 1 ||
  word === `I` ||
  word === `a` ||
  word === `A` ||
  word ===`&`){
    newArr.push(word)
  }
})

text = newArr.join(` `)

fs.writeFileSync(`cleanDanaherPosts.txt`, text, `utf8`)
