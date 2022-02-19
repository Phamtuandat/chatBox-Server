const express = require('express')
const Authenticate = require('../middlewares/Authenticate')
const chatRoomController = require('../controllers/chatRoom-controller')
const router = express.Router()

router.use(Authenticate)

router.post('/:roomId', chatRoomController.createMessage)
router.get('/:roomId', chatRoomController.getConversation)

module.exports = router
