const generateQuoteButton = document.getElementsByTagName(`button`)[0]

generateQuoteButton.addEventListener(`click`, event => {
  console.log(`button attached!`)
  event.preventDefault()
})
