const mongoose = require('mongoose')

const Schema = mongoose.Schema

const roomSchema = new Schema(
    {
        name: { type: String, required: true },
        users: [{ type: mongoose.Types.ObjectId, required: true, ref: 'User' }],
        admins: [{ type: mongoose.Types.ObjectId, required: true, ref: 'User' }],
        createAt: {
            type: Date,
            default: Date.now(),
        },
    },
    {
        timestamps: true,
    }
)

module.exports = mongoose.model('Room', roomSchema)
