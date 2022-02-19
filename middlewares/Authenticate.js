const jwt = require('jsonwebtoken')

const HttpError = require('../models/Http-err')

module.exports = function (req, res, next) {
    if (req.method === 'OPTIONS') {
        return next()
    }
    try {
        const token = req.headers.authorization.split(' ')[1]
        if (!token) {
            return next(new HttpError('Authenticate failed! Please try again later.', 403))
        }
        const encodeToken = jwt.verify(token, process.env.PRIVATE_TOKEN)
        req.userData = { email: encodeToken.email, uid: encodeToken.userId }
        next()
    } catch (error) {
        return next(new HttpError('Authenticate failed! Please try again later.', 403))
    }
}
