const mongoose=require('mongoose')
const CommentSchema=new mongoose.Schema({
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    content:{
        type:String,
        trim:true
    },
    post:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Post"
    }
})
const Comment=mongoose.model("Comment",CommentSchema)
module.exports={Comment}