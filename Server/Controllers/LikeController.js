const asyncHandler = require('express-async-handler')
const { Like } = require('../Models/LikeModel')

const addLike = asyncHandler(async (req, res) => {
    const { postId } = req.body
    try {
        const like = await Like.create({ postId, userId: req.user })
        res.status(200).json(like)
    } catch (err) {
        res.status(400).send(err.message)
    }
})

const getLike = asyncHandler(async (req, res) => {
    try {
        const likes = await Like.find({ postId: req.params.postId })
        res.status(200).json(likes)
    } catch (err) {
        res.status(400).send(err.message)
    }
})

const deleteLike = asyncHandler(async (req, res) => {
    try {
        const like = await Like.findOne({
            postId: req.params.postId,
            userId: req.params.userId,
        })
        const deleted = await Like.findByIdAndDelete(like._id)
        res.status(200).json(deleted)
    } catch (err) {
        res.status(400).send(err.message)
    }
})

module.exports = { addLike, getLike, deleteLike }
