const mongoose = require('mongoose')

const Schema = mongoose.Schema
const MESSAGE_TYPES = {
    TYPE_TEXT: 'text',
}
const readByRecipientSchema = new Schema({
    _id: false,
    readByUserId: { type: mongoose.Types.ObjectId, ref: 'user' },
    readAt: {
        type: Date,
        default: Date.now(),
    },
})
const messageSchema = new Schema(
    {
        chatRoomId: { type: mongoose.Types.ObjectId, ref: 'Rom', requrie: true },
        message: mongoose.Schema.Types.Mixed,
        type: {
            type: String,
            default: () => MESSAGE_TYPES.TYPE_TEXT,
        },
        postedByUser: { type: mongoose.Types.ObjectId, requrie: true, ref: 'User' },
        readByRecipients: [readByRecipientSchema],
    },
    {
        timestamps: true,
        collection: 'chatmessages',
    }
)

module.exports = mongoose.model('chatmessages', messageSchema)
