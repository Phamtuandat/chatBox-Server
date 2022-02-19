const express = require('express')
const UserController = require('../controllers/User')
const Authenticate = require('../middlewares/Authenticate')
const router = express.Router()

router.use(Authenticate)

router.get('/find', UserController.findUser)

module.exports = router
