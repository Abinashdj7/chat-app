const mongoose = require('mongoose')
const colors = require('colors')
const url = process.env.MONGO_URI || "mongodb+srv://root:root@cluster0.vxapsxe.mongodb.net/FireBaseReFormat?retryWrites=true&w=majority&appName=Cluster0"
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(url)
        console.log(`MongoDB connected : ${conn.connection.host.cyan.underline}`)
    } catch (err) {
        console.log(`Error : ${err.message}`.red.bold)
        process.exit(1)
    }
}
module.exports = { connectDB }