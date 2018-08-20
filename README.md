# Markov Chain Based John Danaher instagram post generator

## What is this

This is a set of JavaScript files which can be used to procedurally generate instagram posts in the style of John Danaher based on a Markov chain of his social media posts. Who is that and why make a script for this, you ask? Danaher is a (relatively) famous brazilian jiu jitsu coach, especially known in the community for his lengthy and, let's say, distinctively, written social media posts. As a longtime follower of his, I wanted to see if I could use his considerable corpus of work to procedurally generate Danaher-y quotes with a Markov chain.

### Additional context:

https://www.newyorker.com/culture/persons-of-interest/the-jujitsu-master-turning-an-ancient-art-into-a-modern-science
https://en.wikipedia.org/wiki/Markov_chain

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

I'd like to add this script to a website with a little dropdown menu that lets you request some quantity of Danaher-style wisdom and hit a button, then recieve an instagram post in his style. It might just be a very plaintext-y site, but if it seems doable I might try to mock up an instagram-style display for the quote, or scrape all his pictures off instagram, then select one at random to go with each post.