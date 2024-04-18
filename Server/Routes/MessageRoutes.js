const express=require('express')
const{sendMessage,allMessages}=require('../Controllers/MessageController')
const { protect } = require('../MiddleWare/AuthMiddleware')
const router=express.Router()
router.route('/:chatId').get(protect,allMessages)
router.route('/').post(protect,sendMessage)
module.exports=router