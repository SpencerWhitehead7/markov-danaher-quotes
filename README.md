# Markov Chain Based John Danaher instagram post generator

## What is this

This is a set of JavaScript files which procedurally generate instagram posts in the style of John Danaher, based on a Markov chain generated from his social media posts. Who is that and why do this, you ask? Danaher is a (relatively) famous brazilian jiu jitsu coach, who makes lengthy and, let's say, distinctively, written social media posts. As a longtime social media follower of his with an interest in procedural generation, I wanted to try using his considerable corpus of work to create Danaher-y quotes with a Markov chain. He doesn't have enough writing to make a chain that always produces truly stunning quotes (yet), but I thought it was cool enough to create a website where people can check out the chain in action.

A site where people can check out the chain in action: <https://markov-danaher-quotes.herokuapp.com/>

A repo for the site: <https://github.com/SpencerWhitehead7/markov-danaher-quotes-site>

### Additional context

<https://www.newyorker.com/culture/persons-of-interest/the-jujitsu-master-turning-an-ancient-art-into-a-modern-science> (news article about the team)

<https://www.instagram.com/p/Bm1rtgJBLTS/?taken-by=danaherjohn> (representative post)

<https://www.youtube.com/watch?v=rIzroXoyn2Y> (talking about bjj)

<https://www.youtube.com/watch?v=g06mHKoEl7g> (official video of a match mentioned in the article, Tonon vs Palhares at Polaris 3)

<https://en.wikipedia.org/wiki/Markov_chain> (what is a markov chain)

## Files

A brief description of a way to (crudly, semi-by-hand) scrape the text of facebook posts is in scraping.js

The plaintexts of his social media posts, which I scraped off facebook, are in the danaherPosts.txt file

The script used to clean the posts into a format appropriate for turning into a Markov chain is in cleanText.js

A version of them cleaned for processing into a Markov chain is in cleanDanaherPosts.txt

The actual code for creating the chains is in the generateMarkov.js file

Markov chains based on the previous 1-5 words are in the markov1-5.txt files, as JSON strings

The script that actually generates the posts and logs them is in generateQuote.js

calculateMetadata is basically a scrap paper file I used for getting metadata on the posts/sentences/etc.

## Future Plans

Once every few months, I'd like to scrape all his new posts off social media and regenerate the markov chain with more data. The chain will get better at mimicking him the more he writes and the more data I can feed it, so in ten years or so my program should be able to write his posts for him and no one'll know the difference (just kidding).

It would also be nice to tweak the way sentences are generated so the lengths are a little less arbitrary, and it would be really cool to make sure the sentences are all (sort of) gramatically correct while still being procedurally generated. Right now, their generation is entirely probabilistic, so you get a fair number of weird sentence fragments. However, I do like the fact that right now the quotes are the result of almost pure chance, since that just makes it more fun when the generator spits out something genuinely funny or coherent, so I might not mess with the algorithm to make it more "correct."
