const mongoose = require('mongoose')
// var uniqueValidator = require('mongoose-unique-validator')

const Schema = mongoose.Schema

const userSchema = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true, minlength: 6 },
        image: { type: String },
        rooms: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Room', unique: true }],
        connections: [{ type: mongoose.Types.ObjectId, required: true, ref: 'User' }],
        googleId: { type: String },
    },
    {
        timestamps: true,
    }
)
// userSchema.plugin(uniqueValidator)
module.exports = mongoose.model('User', userSchema)
