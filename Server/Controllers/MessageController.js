const asyncHandler = require('express-async-handler')
const { Message } = require('../Models/MessageModel')
const { Chat } = require('../Models/ChatModel')
const { User } = require('../Models/UserModel')
const cache = require('../Cache')

const allMessages = asyncHandler(async (req, res) => {
    const cacheKey = cache.keys.chatMessages(req.params.chatId)
    const cached = await cache.get(cacheKey)
    if (cached) return res.json(cached)

    try {
        const messages = await Message.find({ chat: req.params.chatId })
            .populate("sender", "name pic email")
            .populate("chat")
        await cache.set(cacheKey, messages, cache.TTL.MESSAGES)
        res.json(messages)
    } catch (err) {
        res.status(400)
        throw new Error(err.message)
    }
})

const sendMessage = asyncHandler(async (req, res) => {
    const { content, chatId } = req.body
    if (!content || !chatId) {
        return res.sendStatus(400)
    }
    try {
        var message = await Message.create({
            sender: req.user._id,
            content,
            chat: chatId
        })
        const sender = await User.findById(message.sender, "name pic")
        const chat = await Chat.findById(message.chat)

        await cache.del(
            cache.keys.chatMessages(chatId),
            ...(chat?.users || []).map(u => cache.keys.userChats(u.toString()))
        )

        res.json({
            _id: message._id,
            content,
            sender,
            chat,
            createdAt: message.createdAt,
            updatedAt: message.updatedAt
        })
    } catch (err) {
        res.status(400)
        throw new Error(err.message)
    }
})

module.exports = { allMessages, sendMessage }
