const dotenv = require('dotenv')
dotenv.config()
const { connectDB } = require('./Db')
connectDB()
const createApp = require('./createApp')
const app = createApp()

const server = app.listen(5000, () => {
    console.log("Server is running on port : 5000 ...")
})

const clientUrl = process.env.CLIENT_URL || "http://localhost:5173"
const io = require('socket.io')(server, {
    pingTimeout: 60000,
    cors: { origin: clientUrl }
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
        if (!chat.users) return
        chat.users.forEach((user) => {
            if (user._id === newMessageRecieved.sender._id) return
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
