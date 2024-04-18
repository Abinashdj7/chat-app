const asyncHandler=require('express-async-handler')
const {Message}=require('../Models/MessageModel')
const {Chat}=require('../Models/ChatModel')
const {User}=require('../Models/UserModel')
const allMessages=asyncHandler(async(req,res) => {
    try{
        const messages=await Message.find({
            chat:req.params.chatId
        }).populate("sender","name pic email")
        .populate("chat")
        res.json(messages)
    }catch(err){
        res.status(400)
        throw new Error(err.message)
    }
})
const sendMessage=asyncHandler(async(req,res) => {
    const{content,chatId}=req.body
    if(!content || !chatId){
        console.log("Invalid data passed into request")
        return res.sendStatus(400)
    }
    var newMessage={
        sender:req.user._id,
        content:content,
        chat:chatId
    }
    try{
        var message=await Message.create(newMessage)
        const sender=await User.findById(message.sender,"name pic")
        const chat=await Chat.findById(message.chat)
        res.json({
            _id:message._id,
            content:content,
            sender,
            chat,
            createdAt:message.createdAt,
            updatedAt:message.updatedAt
        })
    }catch(err){
        res.status(400)
        throw new Error(err.message)
    }
})
module.exports={allMessages,sendMessage}