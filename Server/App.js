const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const dotenv = require('dotenv')
const path = require('path')
const { connectDB } = require('./Db')
const { notFound, errorHandler } = require('./MiddleWare/ErrorMiddleware')
dotenv.config()
connectDB()
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
const server = app.listen(5000, () => {
    console.log("Server is running on port : 5000 ...")
})
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173"
const io = require('socket.io')(server, {
    pingTimeout: 60000,
    cors: {
        origin: clientUrl
    }
})
io.on("connection", (socket) => {
    console.log("Connected to socket.io")
    socket.on("setup", (userData) => {
        socket.join(userData._id)
        socket.emit("connected")
    })
    socket.on("join chat", (room) => {
        socket.join(room)
    })
    socket.on("typing", (room) => socket.in(room).emit("typing"))
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"))
    socket.on("new message", (newMessageRecieved) => {
        var chat = newMessageRecieved.chat
        if (!chat.users) {
            return;
        }
        chat.users.forEach((user) => {
            if (user._id === newMessageRecieved.sender._id) {
                return;
            }
            socket.in(user._id).emit("message recieved", newMessageRecieved)
        })
    })
    socket.off("setup", () => {
        socket.leave(userData._id)
    })
})
server.on("error", (err) => {
    console.log("Server error : " + err)
})

