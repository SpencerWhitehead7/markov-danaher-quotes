# Markov Chain John Danaher Quote Generator

## What is this

This is a set of files which procedurally generate Instagram posts in the style of John Danaher, based on a Markov chain generated from his real Instagram posts. Danaher is a (relatively) famous brazilian jiu jitsu coach, who makes lengthy, distinctively written social media posts. As a longtime social media follower of his with an interest in procedural generation, I wanted to use his considerable corpus of work to create Danaher-y quotes with a Markov chain. You can see the chain in action [here](https://markov-danaher-quotes.herokuapp.com/) and see that site's underlying code [here](https://github.com/SpencerWhitehead7/markov-danaher-quotes-site)

Additional context

- [news article about the team](https://www.newyorker.com/culture/persons-of-interest/the-jujitsu-master-turning-an-ancient-art-into-a-modern-science)
- [official video of a match mentioned in the article, Tonon vs Palhares at Polaris 3](https://www.youtube.com/watch?v=g06mHKoEl7g)
- [a representative post](https://www.instagram.com/p/Bm1rtgJBLTS/?taken-by=danaherjohn)
- [talking about bjj](https://www.youtube.com/watch?v=rIzroXoyn2Y)
- [what is a markov chain](https://en.wikipedia.org/wiki/Markov_chain)

## Files

The plaintexts of his social media posts, [scraped off Instagram](https://github.com/SpencerWhitehead7/social-media-scraper), in postTexts.txt

The actual code for creating the markov chains, in the generateMarkov.js

Markov chains based on the previous 1-5 words, in the markov1-5.json

The script that actually generates and prints the quotes, in generateQuote.js

calculateMetadata is basically a scrap paper file for getting metadata on the posts/sentences/etc

## Future Plans

Once every few months, I'd like to scrape all his new posts off social media and regenerate the markov chain with more data. The chain will get better at mimicking him the more he writes and the more data I can feed it, so in ten years or so maybe the chain will be able to write his posts for him and no one'll know the difference.

It would be nice to tweak the way sentences are generated so the lengths would be less arbitary and they were all (sort of) gramatically correct. Right now, sentence generation is entirely probabilistic, so you get a fair number of weird sentence fragments, but that does make it more fun when the generator spits out something genuinely funny or coherent.

The code could also use a good cleanup in general.
