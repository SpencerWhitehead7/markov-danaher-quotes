# Markov Quote Generator

## What is this

This repository has JavaScript and Rust implementations of creating a [markov chain](https://en.wikipedia.org/wiki/Markov_chain) from raw text and using a markov chain to generate qoutes. It also contains a use of these implementations to procedurally generate fake Instagram post captions.

The fake Instagram posts are in the style of [John Danaher](https://www.newyorker.com/culture/persons-of-interest/the-jujitsu-master-turning-an-ancient-art-into-a-modern-science) and are generated from a Markov chain that was generated from his [real Instagram posts](https://www.instagram.com/p/Bm1rtgJBLTS/?taken-by=danaherjohn). Danaher is a (relatively) famous [brazilian jiu jitsu](https://www.youtube.com/watch?v=g06mHKoEl7g) coach with a posting habit, and the huge body of [long, elaborate, distinctively written](https://www.youtube.com/watch?v=rIzroXoyn2Y) work he's posted over the years is good raw material for procedural quote generation.

## Sample site

You can see the danaher quote generator in action on this repos' github pages site [here](https://spencerwhitehead7.github.io/markov-danaher-quotes). Github is serving the static assets, but the posts are generated on demand by an AWS lambda written in Rust. I ain't necessarily proud of the html and css for the site, they're from a version of this project I did quite a while ago now.

## Future plans

Every few months, I'd like to scrape all the new posts off social media and regenerate the markov chain with more data. The chain will get better at mimicking him the more he writes and the more data I can feed it, so maybe in ten years or so the chain will be able to write his posts for him and no one'll know the difference.

It would also be nice to fix up the sample site, especially so it looks less awful on mobile and relies less on literal screenshots of assets from Instagram.

If aws lamda ever gives Rust first class support, I'd also be able to remove all the boilerplate in the quote generator lambda that's just there to give the lambda a runtime for the rust binary.
