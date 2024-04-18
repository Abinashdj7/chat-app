const express=require('express')
const router=express.Router()
const{getComments,makeComment}=require('../Controllers/CommentController')
const { protect } = require('../MiddleWare/AuthMiddleware')
router.route("/:postId").get(protect,getComments)
router.route("/").post(protect,makeComment)
module.exports=router