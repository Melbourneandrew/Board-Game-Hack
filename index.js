const http = require('http')
const fs = require('fs')
const path = require('path')
const express = require('express')
const socketio = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

var matches = [
  {challenger_name: "Alex", challenger_skill: "virgin"}
];

app.use(express.static(path.join(__dirname + '/')))

io.on('connection', (socket)=>{
  // console.log("New client connected to socket")
  socket.emit('message', 'Connected to socket')
  var user = {}

  socket.on('makeUser', (data)=>{
    user.name = data.username
    user.skill = data.skill
    console.log(user.name + " " + user.skill)

    socket.emit('matches', matches)
  })

  socket.on('makeMatch', (data)=>{
    makeMatch(user, data.description)
  })
})

function makeMatch(player, description){
  matches.append({
    challenger_name: player.username,
    challenger_skill: player.skill,
    match_description: description
  })
  console.log("Added match!")
  console.log(matches)
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/home.html'))
})


const port = 3001
server.listen(port, () => {
  console.log(`Game server started on port ${port}`)
})
