const express = require("express")
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidv4 } = require('uuid');
var path = require('path');
const { generateUsername } = require("unique-username-generator");

app.set('view engine', 'ejs')

app.use(express.static(path.join(__dirname, 'public')))
app.get("/", (req, res) => {
    res.redirect(`/${uuidv4()}`)
})
app.get('/:room', (req, res) => {
    res.render('clientTemplate', { createRoomID: req.params.room ,randomUsername: generateUsername(' ')})
})

io.on('connection', socket => { //Here Socket represent the User
    socket.on('join-room', (ROOM_ID, userID, userName) => {
        socket.join(ROOM_ID)
        console.log("User " + userID + "joined room " + ROOM_ID)
        socket.broadcast.to(ROOM_ID).emit('user-connected', userID, socket.id,userName, () => {
            console.log("Broadcasted about" + userID)
        })
        socket.on('disconnect', () => {
            socket.broadcast.to(ROOM_ID).emit('user-disconnected', userID)
        })
    })


    socket.on('myId-send', (id, sId,otherName) => {
        socket.to(sId).emit('add-others', id,otherName)
    })
})

server.listen(3000, function() {
    console.log('Listening on port ' + server.address().port);
  });