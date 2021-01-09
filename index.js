const http = require('http')
const fs = require('fs')
const path = require('path')
const express = require('express')
const socketio = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

var matches = [{
  challenger_name: "Computer",
  challenger_skill: "random",
  match_description: "Digital opponent. Makes moves completly randomly."
}];

// static file middleware
app.use(express.static(path.join(__dirname + '/')))

//socket configurations
io.on('connection', (socket) => {
  // console.log("New client connected to socket")
  socket.emit('message', 'Connected to socket')
  var user = {}

  // sets user values from client to user var in socket
  // user name and user skill will be available to the socket.
  socket.on('makeUser', (data) => {
    user.name = data.username
    user.skill = data.skill
    console.log(user.name + " " + user.skill)

    socket.emit('matches', matches)
  })

  // creates a match and connects socket to a room with a namespace
  // generated on the client
  socket.on('makeMatch', (data) => {
    var room = data.matchID
    makeMatch(user, data.description, room)

    socket.join(room)
    console.log("User " + user.name + " made and joined room " + data.matchID)
  })

  // when user joins a match made by another user.
  // connects socket to the namespace made by the matchmakers client
  socket.on('joinMatch', (id) => {
    socket.join(id)
    console.log("User " + user.name + " joined room " + id)

    io.to(id).emit('joinedMatch', user.name)
  })

  // for debug
  socket.on('stillConnected', (msg) => console.log(msg))

})

//load match details into matches array
function makeMatch(player, description, id) {
  matches.push({
    challenger_name: player.name,
    challenger_skill: player.skill,
    match_description: description,
    match_id: id
  })
  // console.log(matches)
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/html/lobby.html'))
})

app.get('/game', (req, res) => {
  res.sendFile(path.join(__dirname + '/html/game.html'))
})

//mount app
const port = 3000
server.listen(port, () => {
  console.log(`Game server started on port ${port}`)
})
