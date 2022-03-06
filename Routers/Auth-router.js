const express = require('express')
const router = express.Router()
const AuthController = require('../controllers/Auth')
const { check } = require('express-validator')
const Authenticate = require('../middlewares/Authenticate')

router.post(
    '/register',
    [
        check('name').not().isEmpty(),
        check('email').normalizeEmail().isEmail(),
        check('password').isLength({ min: 6 }),
    ],
    AuthController.register
)
router.post(
    '/signin',
    [check('email').not().isEmpty(), check('password').not().isEmpty()],
    AuthController.login
)
router.post(
    '/signinWithGoogle',
    [check('profileObj').not().isEmpty(), check('googleId').not().isEmpty()],
    AuthController.loginWithGoogle
)

module.exports = router
