const socket = io();
var roomID, isTurn = false
//Recieves message event
socket.on('message', (msg) => {
  console.log(msg)
})

//Recieves matches list and displays them
socket.on('matches', (matches) => {
  //Load matches into grid
  matches.forEach((match, i) => {
    var skillColor
    if(match.challenger_skill = 'Novice'){
      skillColor = 'green'
    }else if(match.challenger_skill = 'Advanced'){
      skillColor = 'gold'
    }else if(match.challenger_skill = 'Expert'){
      skillColor = 'darkred'
    }else{
      match.challenger_skill = "noob"
      skillColor = "black"
    }
    //Make match card component
    var match_card = $(`<div class='card match-lobby-gamecard' style='width: 18rem;'>
        <div class='card-body'>
          <h5 class='card-title'></h5>
          <h6 class='card-subtitle mb-2 text-muted'><span id = "matchSkill" class="badge">4</span></h6>
          <p class='card-text'></p>
          <button type="button" class="btn btn-primary btn-sm play-button">Play</button>
        </div>`)

    match_card.find(".card-title").text(match.challenger_name)
    match_card.find("#matchSkill").text(match.challenger_skill)
    match_card.find(".card-text").text(match.match_description)
    match_card.find("#matchSkill").css({'background-color':skillColor, 'color':'white'})
    match_card.find(".play-button").attr('onclick', `enterMatch(${match.match_id},{delete:true})`)

    $(".match-lobby-grid").prepend(match_card)
  })
})

//Recieves confirmation that the match(room) has been joined
socket.on('joinedMatch', (data) => {
  console.log("User " + data.usr + " has joined match "+ data.matchid)
  roomID = data.id
  isTurn = true
  $('#waiting').text("Play!")
})

$(() => {
  //Sends user session info thru socket
  $('#make-user-button').click(() => {
    var uname = $('#uname-input').val()
    var uskill =$('#skillSelect').val()
    socket.emit('makeUser', {
      username: uname,
      skill: uskill
    })

    $('#myModal').remove()
    $('#make-match-form-button').css("display", "block")
  })

  //Makes a match and sends thru socket
  $('#make-match-button').click(() => {
    var desc = $('#mdesc-input').val()
    var id = Math.floor((Math.random() * 1000) + 1);
    socket.emit('makeMatch', {
      description: desc.toString(),
      matchID: id.toString()
    })

    enterMatch(id, {delete:false});

  })

})

//onclick method for entering the match from dynamically created button
function enterMatch(id, destroy) {
  socket.emit('joinMatch', id.toString())
  $.get('/game', (res) => {
    var gamePage = $(res)
    $('body').html(gamePage)
  })

  if(destroy.delete){
    socket.emit('deleteMatch', id)
  }


}
