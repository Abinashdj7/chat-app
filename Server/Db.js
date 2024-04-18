const mongoose=require('mongoose')
const colors=require('colors')
const url="mongodb+srv://root:root@cluster0.vxapsxe.mongodb.net/FireBaseReFormat?retryWrites=true&w=majority&appName=Cluster0"
const connectDB=async() => {
    try{
        const conn=await mongoose.connect(url,{
            useNewUrlParser:true,
            useUnifiedTopology:true
        })
        console.log(`MongoDB connected : ${conn.connection.host.cyan.underline}`)
    }catch(err){
        console.log(`Error : ${err.message}`.red.bold)
        process.exit(1)
    }
}
module.exports={connectDB}