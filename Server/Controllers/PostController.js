const asyncHandler = require('express-async-handler')
const { Post } = require('../Models/PostModel')
const cache = require('../Cache')

const getPost = asyncHandler(async (req, res) => {
    const cacheKey = cache.keys.allPosts()
    const cached = await cache.get(cacheKey)
    if (cached) return res.status(200).send(cached)

    try {
        const posts = await Post.find().sort({ updatedAt: -1 })
        await cache.set(cacheKey, posts, cache.TTL.POSTS)
        res.status(200).send(posts)
    } catch (err) {
        res.status(400).send(err.message)
    }
})

const makePost = asyncHandler(async (req, res) => {
    try {
        const post = await Post.create({
            title: req.body.title,
            description: req.body.description,
            image: req.body.image,
            userId: req.user,
            username: req.body.username
        })
        await cache.del(cache.keys.allPosts())
        res.status(200).json(post)
    } catch (err) {
        res.status(400).send(err.message)
    }
})

module.exports = { makePost, getPost }
