document.getElementById(`generate-quote`).addEventListener(`click`, async () => {
  try {
    const [quoteData, imageData] = await Promise.all([
      // lambda quote generator url
      // you have to enable CORS for local site to do local development
      // https://console.aws.amazon.com/apigateway/main/develop/cors?api=rwh12q49dc&integration=updl00m&region=us-east-1&routes=rmytrvi
      fetch(`https://rwh12q49dc.execute-api.us-east-1.amazonaws.com/quote`, { method: `GET` }),
      fetch(`postImages/${Math.floor(Math.random() * 25) + 1}.webp`, { method: `GET` }),
    ])
    const [{ quote }, image] = await Promise.all([
      quoteData.json(),
      imageData.blob(),
    ])

    document.getElementById(`insta__caption`).innerHTML = `<b>danaherjohn </b>${quote}`
    document.getElementById(`insta__image`).src = URL.createObjectURL(image)

    const { timeStamp, likes } = generatePostsAndLikes()
    document.getElementById(`insta__timestamp`).innerText = timeStamp
    document.getElementById(`insta__likes`).innerText = likes

    document.getElementById(`insta`).style = `display:flex;`
  } catch (err) {
    console.error(err)
  }
})

const generatePostsAndLikes = () => {
  const daysHours = Math.random() > 0.2 ? `DAYS` : `HOURS`
  const ago = daysHours === `DAYS` ?
    Math.floor(Math.random() * 320) + 1 :
    Math.floor(Math.random() * 24) + 1
  const likes = daysHours === `DAYS` ?
    Math.floor(5000 + (Math.random() * 2000 * (Math.random() > 0.5 ? 1 : -1))) :
    Math.floor((80 + (Math.random() * 20 * (Math.random() > 0.5 ? 1 : -1))) * ago)
  return {
    timeStamp: `${ago} ${daysHours} AGO`,
    likes: `${likes} likes`,
  }
}
