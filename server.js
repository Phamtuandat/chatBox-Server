const express = require('express')
const app = express()
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const HttpErr = require('./models/Http-err')
const AuthRouter = require('./Routers/Auth-router')
const roomRouter = require('./Routers/Rom-router')
const chatRoomRouter = require('./Routers/chatRoom-router')
const webSocket = require('./utils/webSocketIo')
const http = require('http')
const { Server } = require('socket.io')
const webSocketIo = require('./utils/webSocketIo')
const server = http.createServer(app)
const userRouter = require('./Routers/User-router')

const cors = require('cors')
global.io = new Server(server, {
    cors: {
        origin: 'https://chat-box-client.vercel.app',
    },
})
require('dotenv').config()
app.use(
    cors({
        origin: 'https://chat-box-client.vercel.app',
    })
)
app.use(bodyParser.json())
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    )
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS')

    next()
})

app.use('/api/auth', AuthRouter)
app.use('/api/room', roomRouter)
app.use('/api/chatRoom', chatRoomRouter)
app.use('/api/user', userRouter)

app.use((error, req, res, next) => {
    if (res.headerSent) {
        return next(error)
    }
    res.status(error.code || 500)
    res.json({ message: error.message || 'An unknown error occurred!' })
})

global.io.on('connection', webSocketIo.connection)

const PORT = 5000 || process.env.PORT
if (process.env.NODE_ENV === 'production') {
    // set static folder
    app.use(express.static('client/build'))
}
mongoose
    .connect(
        `mongodb+srv://${process.env.DB_HOST}:${process.env.DB_PASS}@cluster0.q1mbt.mongodb.net/mern?retryWrites=true&w=majority`
    )
    .then(() => {
        server.listen(PORT, () => {
            console.log('server is ready')
        })
    })
    .catch((err) => {
        console.log(err)
    })
