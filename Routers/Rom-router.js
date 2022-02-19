const express = require('express')
const Authenticate = require('../middlewares/Authenticate')
const roomController = require('../controllers/Room-controller')
const { check } = require('express-validator')

const router = express.Router()

router.use(Authenticate)

router.post('/new', [check('name').not().isEmpty()], roomController.createRoom)
router.post(
    '/addUser/:roomId',
    [check('userList').not().isArray({ min: 1 })],
    roomController.addUser
)
router.delete('/:roomId', roomController.deleteRoom)
router.get('/:id', roomController.getRoomById)
router.delete('/user/:roomId', roomController.deleteUser)
router.get('/', roomController.getRoomListByUserId)

module.exports = router
