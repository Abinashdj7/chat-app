const asyncHandler=require('express-async-handler')
const {Like}=require('../Models/LikeModel')
const addLIke=asyncHandler(async(req,res) => {
    const{postId}=req.body
    try{
        const like=await Like.create({
            postId:postId,
            userId:req.user
        })
        res.status(200).json(like)
    }catch(err){
        res.status(400).send(err.message)
    }
})
const getLike=asyncHandler(async(req,res) => {
    try{
    const like=await Like.find({
        postId:req.params.postId
    })
    res.status(200).json(like)
}catch(err){
    res.status(400).send(err.message)
}
    
})
const deleteLike=asyncHandler(async(req,res) => {
    try{
        const likeToDelete=await Like.findOne({
            $and:[
                {postId:{$eq:req.params.postId}},
                {userId:{$eq:req.params.userId}}
            ]
        })
        const likeDeleted=await Like.findByIdAndDelete(likeToDelete._id)
        res.status(200).json(likeDeleted)
    }catch(err){
        res.status(400).send(err.message)
    }
})
module.exports={addLIke,getLike,deleteLike}