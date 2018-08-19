const fs = require(`fs`)

let text = fs.readFileSync(`./danaherPosts.txt`, `utf8`)

text = text.replace(/[^\w\s.!?,;'-]|[_]/gi, ``).replace(/[\r\n]+/g,` `).replace(/\s\s+/g, ` `)

const arr = text.split(` `)

const newArr = []

arr.forEach(word => {
  if(word.includes(`.`) && word[word.length-1] !== `.`){
    word.replace(/\./g, `. `)
    newArr.push(word)
  }else if(word.length > 1 || word === `I` || word === `a` || word === `A`){
    newArr.push(word)
  }
})

text = newArr.join(` `)

fs.writeFileSync(`cleanDanaherPosts.txt`, text, `utf8`)
