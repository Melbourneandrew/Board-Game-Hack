const http = require('http')
const fs = require('fs')
const path = require('path')
const express = require('express')
const socketio = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

//by default the user is O, not X


//default match with computer is always available
var matches = [{
  challenger_name: "Computer",
  challenger_skill: "random",
  match_description: "Digital opponent. Makes moves completly randomly.",
  match_id: "0"
}];

// static file middleware
app.use(express.static(path.join(__dirname + '/')))

//socket configurations
io.on('connection', (socket) => {
  var user = {isX:false}
  // console.log("New client connected to socket")
  socket.emit('message', 'Connected to socket')

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
    user.room = room
    makeMatch(user, data.description, room)
    //match maker is x
    user.isX = true

    socket.join(room)
    console.log("User " + user.name + " made and joined room " + data.matchID)
  })

  // when user joins a match made by another user.
  // connects socket to the namespace made by the matchmakers client
  socket.on('joinMatch', (id) => {
    socket.join(id)
    user.room = id
    console.log("User " + user.name + " joined room " + id)

    io.to(id).emit('joinedMatch', {usr: user.name, matchid: id})

  })

  socket.on('deleteMatch', (room) =>{
    for(var i = 0; i < matches.length; i++){
      if(matches[i].match_id == room){
        //starting at position i, remove 1 element
        matches.splice(i, 1)
      }
    }
  })

  //tells user if they are x or o
  socket.on('isx', () =>{
    socket.emit('xStatus', user.isX)
  })

  socket.on('reportMove', (index)=>{
    console.log("User " + user.name + " made move at "+ index)
    socket.to(user.room).emit('yourMove', index)
  })

  socket.on('postScore', (points)=>{
    let playerSymbol = points.player ? 'X' : 'O'
    console.log("User "+ playerSymbol+ " has " + points.pts + " points")

    socket.to(user.room).emit('updateScore', {score:points.pts, player:points.player})
  })


  socket.on('disconnect', ()=>{

    //remove any matches a player may have made if they dc
    for(var i = 0; i < matches.length; i++){
      if(matches[i].challenger_name == user.name){
        //starting at position i, remove 1 element
        matches.splice(i, 1)
      }
    }
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

// app.get('/isx', (req,res) => {res.send(user.isX)})

//mount app
const port = 3000
server.listen(port, () => {
  console.log(`Game server started on port ${port}`)
})
