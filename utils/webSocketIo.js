class webSocket {
    users = []
    connection = (client) => {
        client.on('disconnect', () => {
            this.users = this.users.filter((x) => x.socketId !== client.id)
        })
        client.on('identity', (userId) => {
            this.users.push({
                userId,
                socketId: client.id,
            })
        })
        client.on('subscribe', (room, otherUserId = '') => {
            this.subscribeOtherUser(room, otherUserId)
            client.join(room)
        })
        // mute a chat room
        client.on('unsubscribe', (room) => {
            client.leave(room)
        })
    }
    subscribeOtherUser(room, otherUserId) {
        const userSockets = this.users.filter((user) => user.userId === otherUserId)
        userSockets.map((userInfo) => {
            const socketConn = global.io.sockets.connected(userInfo.socketId)
            if (socketConn) {
                socketConn.join(room)
            }
        })
    }
}

module.exports = new webSocket()
