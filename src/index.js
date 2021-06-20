const express = require('express');
const path = require('path');
const http = require('http');
const socket = require('socket.io');
const Filter = require('bad-words');
const { generateMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users')

const app = express();
const server = http.createServer(app)
const io = socket(server);

const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '../public')));


io.on('connection', (socket) => {
    console.log('New socket connection');
    
    socket.on('join', ({ username, room }, callback) => {        
        const { error, user } = addUser({
            id: socket.id,
            username,
            room
        });
        if(error) {
            return callback(error)
        };

        socket.join(user.room);

        socket.emit('message', generateMessage('Admin', 'Welcome!'));
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin',`${user.username} has joined!`));
        
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
    })
    socket.on('sendMessage', (msg, callback) => {
        const user = getUser(socket.id)

        const filter = new Filter()
        if(filter.isProfane(msg)) {
            return callback({
                error: 'Profanity is not allowed!'
            })
        }

        io.to(user.room).emit('message', generateMessage(user.username, msg));
        callback()
    });
    
    socket.on('sendLocation', (location, callback) => {
        const user = getUser(socket.id)
        const url = `https://google.com/maps?q=${location.lat},${location.long}`;

        io.to(user.room).emit('locationMessage', generateMessage(user.username, url));
        callback()
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if(user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left.`));
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }        
    })
});


server.listen(port, () => {
    console.log('Server running on port', port)
})