const x_icon = `<svg class='x' xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
  <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
</svg>`
const o_icon = `<svg class='o' xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-app" viewBox="0 0 16 16">
  <path d="M11 2a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3h6zM5 1a4 4 0 0 0-4 4v6a4 4 0 0 0 4 4h6a4 4 0 0 0 4-4V5a4 4 0 0 0-4-4H5z"/>
</svg>`

let gameBoardSize = 100
let gameBoard = new Array(gameBoardSize)

var isX
var isTurn = false

$(() => {
  // socket.emit('stillConnected', "still on in game.js")

  socket.emit('isx')
  socket.on('xStatus', (data) => {
    isX = data
    isTurn = data
  })
  socket.on('yourMove', (data) => {
    console.log("They made move: " + data + ". now its your move!")
    isTurn = true
    if (data) {
      placeSymbol(data)
    }
  })

  for (let i = 0; i < gameBoardSize; i++) {
    $('.game-grid').append(`<div id='${i}' class='game-square open'></div>`)
  }
  console.log("turn is:" + isTurn)
  $('.game-grid').on('mouseenter', '.open', hoverOn)
  $('.game-grid').on('mouseleave', '.open', hoverOff)

  $('.game-grid').on('click', '.open', placeSymbol)

})

function hoverOn() {
  // console.log("Hover on called. Turn is: "+ isTurn)
  if (!isTurn) {
    return false
  }

  let index = $(this).attr('id')
  let inverseIndex = (gameBoardSize-1) - index
  let selector = '#' + index.toString()
  let inverseSelector = '#' + inverseIndex.toString();


  $(selector).append(isX ? x_icon : o_icon)

  $(inverseSelector).css({
    "opacity": "0.5"
  })
  $(inverseSelector).append(isX ? x_icon : o_icon)
}

function hoverOff() {
  if (!isTurn) {
    return false
  }

  let index = $(this).attr('id')
  let inverseIndex = (gameBoardSize-1) - index
  let selector = '#' + index.toString()
  let inverseSelector = '#' + inverseIndex.toString();

  $(inverseSelector).css({

    "opacity": "1.0"
  })

  //If game square has not had a move made
  if (gameBoard[index] != 'x' && gameBoard[index] != 'o') {
    $(selector).empty()
    $(inverseSelector).empty()
  }
}

function placeSymbol(tile) {
  if (!isTurn) {
    return false
  }

  if (tile < (gameBoardSize+1)) {
    //Opponents move

    let inverseTile = (gameBoardSize-1) - tile
    let tileSelector = '#' + tile.toString()
    let inverseTileSelector = '#' + inverseTile.toString();

    $(inverseTileSelector).css({
      "opacity": "1.0"
    })
    $(tileSelector).removeClass('open')
    $(inverseTileSelector).removeClass('open')

    $(tileSelector).append(!(isX) ? x_icon : o_icon)
    $(inverseTileSelector).append(!(isX) ? x_icon : o_icon)

    //inverse of whatever player is
    gameBoard[tile] = !(isX) ? 'x' : 'o'
    gameBoard[inverseTile] = !(isX) ? 'x' : 'o'

  } else {
    //Players move
    let index = $(this).attr('id')
    let inverseIndex = (gameBoardSize-1) - index
    let selector = '#' + index.toString()
    let inverseSelector = '#' + inverseIndex.toString()

    console.log($(selector))

    $(inverseSelector).css({
      "opacity": "1.0"
    })
    $(selector).removeClass('open')
    $(inverseSelector).removeClass('open')


    // $(selector).append(isX ? x_icon : o_icon)
    // $(inverseSelector).append(isX ? x_icon : o_icon)

    reportMove(index)

    gameBoard[index] = isX ? 'x' : 'o'
    gameBoard[inverseIndex] = isX ? 'x' : 'o'
  }
}

function reportMove(indx) {
  socket.emit('reportMove', indx)

  isTurn = false;

  console.log("Reporting move " + indx + " player turn = " + isTurn)

}
