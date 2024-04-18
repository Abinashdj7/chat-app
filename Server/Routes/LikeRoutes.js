const express=require('express')
const router=express.Router()
const {addLIke,getLike,deleteLike}=require('../Controllers/LikeController')
const {protect}=require('../MiddleWare/AuthMiddleware')
router.route("/").post(protect,addLIke)
router.route("/:postId").get(protect,getLike)
router.route("/:postId/:userId").delete(protect,deleteLike)
module.exports=router