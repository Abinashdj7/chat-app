const asyncHandler = require('express-async-handler')
const { User } = require('../Models/UserModel')
const generateToken = require('../MiddleWare/GenerateToken')
const allUsers = asyncHandler(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: "User not authenticated" })
    }
    console.log(req.user)
    const keyword = req.query.search ? {
        $or: [
            { name: { $regex: req.query.search, $options: 'i' } },
            { email: { $regex: req.query.search, $options: 'i' } }
        ]
    } : {}
    const users = await User.find(keyword).find({
        _id: { $ne: req.user._id }
    })
    res.send(users)
})
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, pic } = req.body
    if (!name || !email || !password) {
        res.status(400)
        throw new Error("Please enter all details")
    }
    const userExists = await User.findOne({ email })
    if (userExists) {
        res.status(400)
        throw new Error("User already exists")
    }
    const user = await User.create({
        name, 
        email, 
        password, 
        pic,
    })
    if (user) {
        res.status(201).send({
            _id: user._id,
            name:user.name,
            email:user.email,
            isAdmin:user.isAdmin,
            pic:user.pic,
            token:generateToken(user._id)
        })
    }else{
        res.status(400)
        throw new Error("User not found")
    }
})
const authUser=asyncHandler(async(req,res) => {
    const {email,password}=req.body
    const user=await User.findOne({email})
    if(user && (await user.matchPassword(password))){
        res.status(201).json({
            _id:user._id,
            name:user.name,
            email:user.email,
            isAdmin:user.isAdmin,
            pic:user.pic,
            token:generateToken(user._id)

        })
    }else{
        res.status(401)
        throw new Error("Invalid email or password")
    }
})
module.exports = { allUsers,registerUser,authUser }