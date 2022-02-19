require('dotenv').config()
const User = require('../models/User-models')
const HttpErr = require('../models/Http-err')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator')

const register = async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return next(new HttpErr('Invalid inputs passed, please check your data.', 422))
    }
    const { name, email, password, image } = req.body
    let passwordHashed
    try {
        passwordHashed = await bcrypt.hash(password, +process.env.HASH_PASSWORD_KEY)
    } catch (error) {
        return next(new HttpErr('something went wrong, please try again later.', 500))
    }
    const newUser = new User({
        name,
        email,
        password: passwordHashed,
        image:
            image ||
            'https://www.google.com/url?sa=i&url=https%3A%2F%2Ftoppng.com%2Froger-berry-avatar-placeholder-PNG-free-PNG-Images_188599&psig=AOvVaw3VMa53IOZE658FjArxfPNV&ust=1634437882809000&source=images&cd=vfe&ved=0CAsQjRxqFwoTCNjOwt3xzfMCFQAAAAAdAAAAABAD',
        rooms: [],
        collections: [],
    })
    let existingUser
    try {
        existingUser = await User.findOne({ email })
    } catch (error) {
        const err = new HttpErr('something went wrong, please try again later!', 500)
        return next(err)
    }
    if (existingUser) {
        return next(new HttpErr('Email is already, please try again with else email!', 422))
    }
    let token
    try {
        token = jwt.sign({ userId: newUser.id }, process.env.PRIVATE_TOKEN, { expiresIn: '1h' })
    } catch (error) {
        const err = new HttpErr('Something went wrong, please try again', 500)
        return next(err)
    }
    newUser.save()
    res.status(201).json({
        user: {
            name: newUser.name,
            email: newUser.email,
            id: newUser._id,
            image: newUser.image,
        },
        token,
        isCreated: true,
        rooms: newUser.rooms,
        connections: newUser.connections,
    })
}
const login = async (req, res, next) => {
    const { email, password } = req.body
    let user
    try {
        user = await User.findOne({ email })
    } catch (error) {
        const err = new HttpErr('something went wrong, please try again later.', 500)
        return next(err)
    }
    if (!user) {
        const err = new HttpErr('Email is not exited, please login that email.', 421)
        return next(err)
    }
    let isInvalidPassword
    try {
        isInvalidPassword = await bcrypt.compare(password, user.password)
    } catch (error) {
        const err = new HttpErr(
            'something went wrong with the password, please try again later!',
            500
        )
        return next(err)
    }
    if (!isInvalidPassword) {
        const err = new HttpErr('Password is not valid, please try again later', 401)
        return next(err)
    }
    let token
    try {
        token = jwt.sign({ email, userId: user.id }, process.env.PRIVATE_TOKEN)
    } catch (error) {
        const err = new HttpErr('Something went wrong, please try again', 500)
        return next(err)
    }
    res.status(201).json({
        user: {
            name: user.name,
            email: user.email,
            id: user._id,
            image: user.image,
            rooms: user.rooms,
            connections: user.connections,
        },
        token,
        isCreated: false,
    })
}

exports.register = register
exports.login = login
