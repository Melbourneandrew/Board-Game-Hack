$(() => {
  const socket = io();

  socket.on('message', (msg) => {
    console.log(msg)
  })

  socket.on('matches', (matches) => {
    //Make match card component
    var match_card = $(`<div class='match-lobby-grid'>
    <div class='card match-lobby-gamecard' style='width: 18rem;'>
        <div class='card-body'>
          <h5 class='card-title'></h5>
          <h6 class='card-subtitle mb-2 text-muted'></h6>
          <p class='card-text'>Want to test their skill?</p>
          <a href='#' class='card-link'>Play</a>
          <a href='#' class='card-link'>Another link</a>
        </div>
      </div>`)

    //Load matches into grid
    matches.forEach((match, i) => {
      match_card.find(".card-title").text(match.challenger_name)
      match_card.find(".card-subtitle").text(match.challenger_skill)
      match_card.find(".card-text").text(match.match_description)
      $(".match-lobby-grid").prepend(match_card)
    })
  })

  //Sends user session info thru socket
  $('#make-user-button').click(() => {
    socket.emit('makeUser', {
      username: 'Andrew',
      skill: 'Basic'
    })

    $('#myModal').remove()
  })

  //Makes a match and sends thru socket
  $('#make-match-button').click(() => {
    socket.emit('makeMatch', {
      description: "This is a match"
    })
  })

})
