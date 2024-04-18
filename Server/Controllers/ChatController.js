const asyncHandler=require('express-async-handler')
const {Chat}=require('../Models/ChatModel')
const {User}=require('../Models/UserModel')
const accessChat=asyncHandler(async(req,res) => {
    const {userId}=req.body
    if(!userId){
        return res.status(400).send("Not found")
    }
    var isChat=await Chat.find({
        isGroupChat:false,
        $and:[
            {users:{$elemMatch:{$eq:req.user._id}}},
            {users:{$elemMatch:{$eq:userId}}}
        ]
    }).populate("users","-password")
    .populate("latestMessage")
    isChat=await User.populate(isChat,{
        path:"latestMessage.sender",
        select:"name pic email"
    })
    if(isChat.length>0){
        res.send(isChat[0])
    }
    else{
        var chatData={
            chatName:"sender",
            isGroupChat:false,
            users:[req.user._id,userId]
        }
    }
    try{
        const createdChat=await Chat.create(chatData)
        const fullChat=await Chat.findOne({_id:createdChat._id}).populate("users","-password")
        res.status(200).json(fullChat)
    }catch(err){
        res.status(400).send(`Error:${err.message}`)
        throw new Error(err.message)
    }
})
const fetchChat=asyncHandler(async(req,res) => {
    try{
        Chat.find({users:{$elemMatch:{$eq:req.user._id}}})
        .populate("users","-password").populate("latestMessage")
        .then(async(results) => {
            results=await User.populate(results,{
                path:"latestMessage.sender",
                select:"name pic email"
            })
            res.status(200).send(results)
        })
    }catch(err){
        res.status(400)
        throw new Error(err.message)
    }
})
const createGroupChat=asyncHandler(async(req,res) => {
    if(!req.body.users || !req.body.name){
        return res.status(400).send("Please fill all fields")
    }
    var users=JSON.parse(req.body.users)
    if(users.length<2){
        return res.status(400).send("More than two users are required to create group chat")
    }
    users.push(req.user)
    try{
        const groupChat=await Chat.create({
            chatName:req.body.name,
            users:users,
            isGroupChat:true,
            groupAdmin:req.user
        })
        const fullGroupChat=await Chat.findOne({_id:groupChat._id}).populate("users","-password")
        .populate("groupAdmin","-password")
        res.status(200).json(fullGroupChat)
    }catch(err){
        res.status(400)
        throw new Error(err.message)
    }
})
const renameChat=asyncHandler(async(req,res) => {
    const{chatId,chatName}=req.body
    const updatedChat=await Chat.findByIdAndUpdate(chatId,{
        chatName:chatName
    },{
        new:true
    }).populate("users","-password").populate("groupAdmin","-password")
    if(!updatedChat){
        res.status(404) 
        throw new Error("Chat not found")
    }
    else{
        res.json(updatedChat)
    }
})
const addToGroup=asyncHandler(async(req,res) => {
    const{chatId,userId}=req.body
    try{
    const added=await Chat.findByIdAndUpdate(chatId,{
        $push:{users:userId}
    }).populate("users","-password").populate("groupAdmin","-password")
    if(!added){
        res.status(400)
        throw new Error("Chat not found")
    }
    else{
        res.json(added)
    }
}catch(err){
    res.status(400).send(err)
}
})
const removeFromGroup=asyncHandler(async(req,res) => {
    const{chatId,userId}=req.body
    const removed=await Chat.findByIdAndUpdate(chatId,{
        $pull:{users:userId}
}).populate("users","-password").populate("groupAdmin","-password")
    if(!removed){
    res.status(400)
    throw new Error("Chat not found")
    }
    else{
        res.json(removed)
    }
})
module.exports={accessChat,fetchChat,createGroupChat,addToGroup,renameChat,removeFromGroup}