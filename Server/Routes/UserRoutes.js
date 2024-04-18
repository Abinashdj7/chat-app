const express=require('express')
const {allUsers, authUser,registerUser}=require('../Controllers/UserController')
const {protect}=require('../MiddleWare/AuthMiddleware')
const router=express.Router()
router.route("/").get(protect,allUsers)
router.route("/").post(registerUser)
router.post("/login",authUser)
module.exports=router