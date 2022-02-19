const HttpErr = require('../models/Http-err')
const Room = require('../models/Room-model')
const User = require('../models/User-models')
const { validationResult } = require('express-validator')
const mongoose = require('mongoose')

const createRoom = async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return next(new HttpErr('Invalid inputs passed, please check your data.', 422))
    }
    const { name } = req.body
    const { uid } = req.userData

    const createRoom = new Room({
        name,
        users: [uid],
        admins: [uid],
    })

    try {
        const sess = await mongoose.startSession()
        await sess.startTransaction()
        const user = await (await User.findById(uid)).populate('rooms')
        await createRoom.save({ session: sess })
        user.rooms.push(createRoom)
        await user.save({ session: sess })
        await sess.commitTransaction()
        sess.endSession()
        res.status(201).json(user.rooms)
    } catch (error) {
        console.log(error)
        const err = new HttpErr("something wen't wrong, can't create this room.", 500)
        return next(err)
    }
}
const getRoomListByUserId = async (req, res, next) => {
    const { uid } = req.userData
    try {
        const roomList = await Room.find({ users: { _id: uid } })
        res.status(200).json(roomList)
    } catch (error) {
        return next(new HttpErr("something wen't wrong", 500))
    }
}
const addUser = async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.array()) {
        return next(new HttpErr('Invalid inputs passed, please check your data.', 422))
    }
    const { uid } = req.userData
    const { userList } = req.body
    const { roomId } = req.params

    let room
    try {
        room = await Room.findById(roomId)
    } catch (error) {
        const err = new HttpErr("can't find room, please try again with room id else.", 442)
        return next(err)
    }
    if (!room) {
        return next(new HttpErr("can't find room, please try again with room id else", 422))
    }
    const index = room.admins.findIndex((x) => x.toString() === uid)
    if (index === -1) {
        return next(new HttpErr('You not allowed add user to this room', 421))
    }
    try {
        const sess = await mongoose.startSession()
        sess.startTransaction()

        await User.updateMany(
            { _id: { $in: userList } },
            { $push: { rooms: room.id } },
            { session: sess }
        )
        room.users.push(...userList)
        await room.save({ session: sess })
        await sess.commitTransaction()
        res.status(201).json(room)
    } catch (error) {
        console.log(error)
        const err = new HttpErr("something wen't wrong, can't add user to room.", 500)
        return next(err)
    }
}
const deleteRoom = async (req, res, next) => {
    const { roomId } = req.params
    const { uid } = req.userData
    let room
    try {
        room = await await Room.findById(roomId)
    } catch (error) {
        const err = new HttpErr("something wen't wrong, can't remove user from room.", 500)
        return next(err)
    }
    if (!room) {
        return next(new HttpErr("can't find room, please try again with room id else", 422))
    }

    const index = room.admins.findIndex((x) => x.toString() === uid)
    if (index === -1) {
        return next(new HttpErr('You not allowed delete this room', 421))
    }
    try {
        const sess = await mongoose.startSession()
        sess.startTransaction()
        let userArray = []
        room.users.forEach((user) => {
            userArray.push(user.id)
        })
        await room.remove({ session: sess })
        await User.updateMany(
            { id: { $in: userArray } },
            { $pull: { rooms: roomId } },
            { session: sess }
        )
        await sess.commitTransaction()
    } catch (error) {
        console.log(error)
        const err = new HttpErr("something wen't wrong, can't delete this room.", 500)
        return next(err)
    }
    res.status(201).json(room)
}
const deleteUser = async (req, res, next) => {
    const { roomId } = req.params
    const { uid } = req.userData
    const { userList } = req.body

    let room

    try {
        room = await Room.findById(roomId)
    } catch (error) {
        const err = new HttpErr("something wen't wrong, can't find room")
        return next(err)
    }

    if (!room) {
        const err = new HttpErr("can't find room, please try again with room id else", 422)
        return next(err)
    }

    const index = room.admins.findIndex((x) => x.toString() === uid)

    if (index === -1) {
        return next(new HttpErr('You not allowed delete this user', 421))
    }
    let userIdList = []
    userList.forEach((x) => {
        if (x !== uid) {
            userIdList.push(x)
        }
    })
    if (userIdList.length === 0) {
        return next(new HttpErr('Users not exists in room.', 422))
    }
    try {
        const sess = await mongoose.startSession()
        sess.startTransaction()
        room.users.pull(...userIdList)
        await room.save({ session: sess })
        await User.updateMany(
            { _id: { $in: userIdList } },
            { $pull: { rooms: roomId } },
            { session: sess }
        )
        await sess.commitTransaction()
    } catch (error) {
        return next(new HttpErr("something went wrong, can't delete this user", 500))
    }
    res.status(201).json(room)
}
const getRoomById = async (req, res, next) => {
    const { uid } = req.userData
    const { id } = req.params
    let ind
    try {
        const user = await User.findById(uid)
        ind = user.rooms.findIndex((x) => x.toString() === id)
    } catch (error) {
        console.log('err')
        return next(new HttpErr("something wen't wrong", 500))
    }
    if (ind === -1) {
        return next(new HttpErr("You're not allowed get this room info", 422))
    }
    try {
        const room = await Room.findById(id).populate('users')
        res.status(200).json(room)
    } catch (error) {
        return next(new HttpErr("someting wen't wrong, please try again late", 500))
    }
}
exports.getRoomById = getRoomById
exports.createRoom = createRoom
exports.addUser = addUser
exports.deleteUser = deleteUser
exports.deleteRoom = deleteRoom
exports.getRoomListByUserId = getRoomListByUserId
