const mongoose = require('mongoose')

const Schema = mongoose.Schema

const roomSchema = new Schema(
    {
        name: { type: String, required: true },
        users: [{ type: mongoose.Types.ObjectId, required: true, ref: 'User', unique: true }],
        admins: [{ type: mongoose.Types.ObjectId, required: true, ref: 'User', unique: true }],
    },
    {
        timestamps: true,
    }
)

module.exports = mongoose.model('Room', roomSchema)
