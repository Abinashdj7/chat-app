const express=require('express')
const {makePost,getPost} =require('../Controllers/PostController')
const {protect}=require('../MiddleWare/AuthMiddleware')
const router=express.Router()
router.route("/").post(protect,makePost)
router.route("/").get(protect,getPost)
module.exports=router