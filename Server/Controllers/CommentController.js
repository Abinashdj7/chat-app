const asyncHandler=require('express-async-handler')
const {Comment}=require('../Models/CommentModel')
const { User } = require('../Models/UserModel')
const { Post } = require('../Models/PostModel')
const getComments=asyncHandler(async(req,res) => {
    try{
        const comments=await Comment.find({post:req.params.postId})
        .populate("sender","name pic email").populate("post")
        res.json(comments)
    }catch(err){
        res.status(400).send(err.message)
    }
})
const makeComment=asyncHandler(async(req,res) => {
   const {content,postId}=req.body
   if(!content || !postId){
    res.sendStatus(400)
   }
   var newComment={
    sender:req.user._id,
    content:content,
    post:postId
   }
   try{
    var comment=await Comment.create(newComment)
    const sender=await User.findById(comment.sender,"name pic")
    const post=await Post.findById(comment.post)
    res.json({
        _id:comment._id,
        content:content,
        sender,
        post,
    })
   }catch(err){
    res.status(400).send(err.message)
   }
})
module.exports={getComments,makeComment}