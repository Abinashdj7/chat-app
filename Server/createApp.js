const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const path = require('path')
const { notFound, errorHandler } = require('./MiddleWare/ErrorMiddleware')

module.exports = function createApp() {
    const app = express()

    const userRoutes = require('./Routes/UserRoutes')
    const chatRoutes = require('./Routes/ChatRoutes')
    const messageRoutes = require('./Routes/MessageRoutes')
    const postRoutes = require('./Routes/PostRoutes')
    const likeRoutes = require('./Routes/LikeRoutes')
    const commentRoutes = require('./Routes/CommentRoutes')

    const authLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 20,
        message: { message: 'Too many attempts, please try again later' }
    })

    app.use(helmet())
    app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:8080' }))
    app.use(express.json())
    app.use(express.urlencoded({ extended: false }))
    app.use('/api/users/login', authLimiter)
    app.use('/api/users', userRoutes)
    app.use('/api/chats', chatRoutes)
    app.use('/api/messages', messageRoutes)
    app.use('/api/posts', postRoutes)
    app.use('/api/likes', likeRoutes)
    app.use('/api/comments', commentRoutes)

    app.use(express.static(path.join(__dirname, 'public')))
    app.get('*', (req, res) => {
        if (!req.originalUrl.startsWith('/api/')) {
            res.sendFile(path.join(__dirname, 'public', 'index.html'))
        }
    })

    app.use(notFound)
    app.use(errorHandler)

    return app
}
