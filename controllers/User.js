const HttpError = require('../models/Http-err')
const User = require('../models/User-models')

const findUser = async (req, res, next) => {
    const { name_like } = req.query
    const rgx = (pattern) => new RegExp(`.*${pattern}.*`)
    const searchRgx = rgx(name_like)
    try {
        const userList = await User.find({ name: { $regex: searchRgx, $options: 'i' } })
        res.json(userList).status(201)
    } catch (error) {
        return next(new HttpError("can't find user", 500))
    }
    res.status(201)
}

exports.findUser = findUser
