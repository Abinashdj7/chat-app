const mongoose=require('mongoose')
const PostSchema=new mongoose.Schema({
    title:{
        type:String,
        trim:true,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:false
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    username:{
        type:String,
        required:true
    },
    latestComment:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Comment"
    }
},{
    timestamps:true
})
const Post=mongoose.model("Post",PostSchema)
module.exports={Post}