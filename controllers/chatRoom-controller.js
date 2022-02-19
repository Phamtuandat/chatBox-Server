const HttpErr = require('../models/Http-err')
const User = require('../models/User-models')
const Room = require('../models/Room-model')
const chatmessages = require('../models/Message')
const Message = require('../models/Message')
const { findOne } = require('../models/User-models')

const createMessage = async (req, res, next) => {
    const { roomId } = req.params
    const { message } = req.body
    const { uid, email } = req.userData

    const newPost = new chatmessages({
        chatRoomId: roomId,
        message,
        postedByUser: uid,
    })
    let roomExisted
    try {
        roomExisted = await Room.findById(roomId)
    } catch (error) {
        return next(new HttpErr("Somthing wen't wrong, can't find room", 500))
    }
    if (!roomExisted) {
        return next(new HttpErr('Room is not existed', 401))
    }
    let post
    try {
        post = await newPost.save()
        post.postedByUser = await User.findById(post.postedByUser, [
            '-password, -connections, -rooms',
        ])
        global.io.sockets.in(roomId).emit('new message', { message: post })
        res.json(post)
    } catch (error) {
        console.log(error)
        return next(new HttpErr("Something wen't wrong, please try again later.", 500))
    }
}
const getConversation = async (req, res, next) => {
    const { roomId } = req.params
    const { uid, email } = req.userData
    const options = {
        page: +req.query.page || 0,
        limit: +req.query.limit || 10,
    }
    let roomExisted
    try {
        roomExisted = await Room.findById(roomId)
    } catch (error) {
        return next(new HttpErr("Something wen't wrong, please try again later.", 500))
    }
    if (!roomExisted) {
        return next(new HttpErr("room dosen't exist.", 500))
    }
    try {
        const conversation = await chatmessages
            .find({ chatRoomId: roomId })
            .sort({ createdAt: 1 })
            .limit(options.limit)
            .skip(options.limit * options.page)
            .populate('postedByUser', ['-password', '-rooms', '-connections'])
        res.status(201).json(conversation)
    } catch (error) {
        console.log(error)
        return next(new HttpErr("Something wen't wrong, please try", 500))
    }
}

exports.createMessage = createMessage
exports.getConversation = getConversation
