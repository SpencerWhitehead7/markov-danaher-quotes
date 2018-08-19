const fs = require(`fs`)

const text = fs.readFileSync(`./danaherPosts.txt`, `utf8`)

const cleanText = text.replace(/[^\w\s.!?,;]|[_]/gi, ``).replace(/[\r\n]+/g,` `).replace(/\s\s+/g, ` `)

fs.writeFileSync(`cleanDanaherPosts.txt`, cleanText, `utf8`)
