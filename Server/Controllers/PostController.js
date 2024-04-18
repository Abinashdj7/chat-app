const asyncHandler=require('express-async-handler')
const {Post}=require('../Models/PostModel')
const getPost=asyncHandler(async(req,res) => {
    try{
    const posts=await Post.find().sort({updatedAt:-1})
    res.status(200).send(posts)
    }catch(err){
        res.status(400).send(err.message)
    }
})
const makePost=asyncHandler(async(req,res) => {
 
    console.log(req.body)
    try{
        const post=await Post.create({
            title:req.body.title,
            description:req.body.description,
            image:req.body.image,
            userId:req.user,
            username:req.body.username
        })
        res.status(200).json(post)
}catch(err){
    res.status(400).send(err.message)
}
})
module.exports={makePost,getPost}