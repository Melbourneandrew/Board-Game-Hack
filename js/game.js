const x_icon = `<svg class='x' xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
  <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
</svg>`
const o_icon = `<svg class='o' xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-app" viewBox="0 0 16 16">
  <path d="M11 2a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3h6zM5 1a4 4 0 0 0-4 4v6a4 4 0 0 0 4 4h6a4 4 0 0 0 4-4V5a4 4 0 0 0-4-4H5z"/>
</svg>`

let gameBoardSize = 100
let gameBoard = new Array(gameBoardSize).fill('.')

var isX
var isTurn = false
var opponentScore

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
    $('#waiting').text('Play!')
  })

  socket.on('updateScore', (score)=>{
    opponentScore = score.score
    console.log("Got opponent score:" + score.score )
    if(score.player){
      $('#xpts').text(score.score)
    }else{
      $('#opts').text(score.score)
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
  let inverseIndex = (gameBoardSize - 1) - index
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
  let inverseIndex = (gameBoardSize - 1) - index
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

  if (tile < (gameBoardSize + 1)) {
    //Opponents move

    let inverseTile = (gameBoardSize - 1) - tile
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
    let inverseIndex = (gameBoardSize - 1) - index
    let selector = '#' + index.toString()
    let inverseSelector = '#' + inverseIndex.toString()

    $(inverseSelector).css({
      "opacity": "1.0"
    })
    $(selector).removeClass('open')
    $(inverseSelector).removeClass('open')

    gameBoard[index] = isX ? 'x' : 'o'
    gameBoard[inverseIndex] = isX ? 'x' : 'o'

    reportMove(index, inverseIndex)
  }
}

function reportMove(indx, inverseIndx) {
  socket.emit('reportMove', indx)
  scoreMove(indx, inverseIndx)

  isTurn = false;

  console.log("Reporting move " + indx + " player turn = " + isTurn)

}
var streaks = []

function scoreMove(tile, inverseTile) {
  var gameOver = true
  gameBoard.forEach((place, i) => {
    if(place == '.'){
      gameOver = false
    }
  });

  if(gameOver){
    socket.emit("GameOver", streaks)
  }

  tile = parseInt(tile)
  inverseTile = parseInt(inverseTile)

  //      *        -11 |  -10 | -9
  //      *       -----+-----+-----
  //      *         -1 | indx | +1
  //      *       -----+-----+-----
  //      *         +9 |  +10 | +11

  var letter = isX ? 'x' : 'o'

  var checkTile = tile
  // console.table(gameBoard)
  var row = [tile]
  var inverseRow = [inverseTile]


  var iterations = 0;

  var diag1 = true,
    diag2 = true,
    diag3 = true,
    diag4 = true,
    i_diag1 = true,
    i_diag2 = true,
    i_diag3 = true,
    i_diag4 = true,
    left = true,
    right = true,
    up = true,
    down = true,
    i_left = true,
    i_right = true,
    i_up = true,
    i_down = true



  //positive diagonal /
  while (true) {
    iterations++
    if (iterations > 200) {
      console.log("overflow")
      break;
    }
    // console.log('tile: ' + gameBoard[tile])

    if (gameBoard[checkTile - 9] == letter && diag1) {
      // console.log("Checking tile : "+(checkTile-9)+ " Value: " + gameBoard[checkTile-9])
      console.log('diag1')
      checkTile -= 9
      row.push(checkTile)
      continue;
    } else if (diag1) {
      checkTile = tile
      diag1 = false
    }


    if (gameBoard[checkTile + 9] == letter && diag2) {
      console.log('diag2')

      checkTile += 9
      row.push(checkTile)

      continue;
    } else if (diag2) {
      checkTile = inverseTile
      diag2 = false;
    }


    if (gameBoard[checkTile - 9] == letter && i_diag1) {
      // console.log("Checking tile : "+(checkTile-9)+ " Value: " + gameBoard[checkTile-9])
      console.log("i_diag1")

      checkTile -= 9
      inverseRow.push(checkTile)
      continue;
    } else if (i_diag1) {
      checkTile = inverseTile
      i_diag1 = false;
    }

    if (gameBoard[checkTile + 9] == letter && i_diag2) {
      console.log("i_diag2")

      checkTile += 9
      inverseRow.push(checkTile)

      continue;
    } else if (i_diag2) {
      checkTile = inverseTile
      i_diag2 = false;
    }


    if (row.length >= 3) {
      streaks.push(row)
      // isSubset( master, sub )
      streaks.forEach((streak, x) => {
        if(isSubset(row, streak)){
          streaks[x] = row
          streaks.length == 0 ? null : streaks.pop
        }
      });

      row.forEach((item, i) => {
        $(`#${item}`).css({
          'background-color': 'gray'
        })
      });
    }

    if (inverseRow.length >= 3) {
      streaks.push(inverseRow)
      // isSubset( master, sub )
      streaks.forEach((streak, x) => {
        if(isSubset(inverseRow, streak)){
          streaks[x] = inverseRow
          streaks.length == 0 ? null : streaks.pop
        }
      });

      inverseRow.forEach((item, i) => {
        $(`#${item}`).css({
          'background-color': 'gray'
        })
      });
    }



    break;
  }

  console.log(streaks.length)

  if(row.length = 3)
  row = [tile]
  inverseRow = [inverseTile]
  iterations = 0
  checkTile = tile

  //negative diagonal \
  while (true) {
    iterations++
    if (iterations > 200) {
      console.log("overflow")
      break;
    }
    // console.log('tile: ' + gameBoard[tile])

    if (gameBoard[checkTile - 11] == letter && diag3) {
      // console.log("Checking tile : "+(checkTile-9)+ " Value: " + gameBoard[checkTile-9])
      console.log("diag3")
      checkTile -= 11
      row.push(checkTile)
      continue;
    } else if (diag3) {
      checkTile = tile
      diag3 = false
    }


    if (gameBoard[checkTile + 11] == letter && diag4) {
      console.log("diag4")

      checkTile += 11
      row.push(checkTile)

      continue;
    } else if (diag4) {
      checkTile = inverseTile
      diag4 = false;
    }

    if (gameBoard[checkTile - 11] == letter && i_diag3) {
      // console.log("Checking tile : "+(checkTile-9)+ " Value: " + gameBoard[checkTile-9])
      console.log("i_diag3")

      checkTile -= 11
      inverseRow.push(checkTile)
      continue;
    } else if (i_diag3) {
      checkTile = inverseTile
      i_diag3 = false;
    }

    if (gameBoard[checkTile + 11] == letter && i_diag4) {
      console.log("i_diag4")

      checkTile += 11
      inverseRow.push(checkTile)

      continue;
    } else if (i_diag4) {
      checkTile = inverseTile
      i_diag4 = false;
    }

    if (row.length >= 3) {
      streaks.push(row)
      // isSubset( master, sub )
      streaks.forEach((streak, x) => {
        if(isSubset(row, streak)){
          streaks[x] = row
          streaks.length == 0 ? null : streaks.pop
        }
      });

      row.forEach((item, i) => {
        $(`#${item}`).css({
          'background-color': 'gray'
        })
      });
    }

    if (inverseRow.length >= 3) {
      streaks.push(inverseRow)
      // isSubset( master, sub )
      streaks.forEach((streak, x) => {
        if(isSubset(inverseRow, streak)){
          streaks[x] = inverseRow
          streaks.length == 0 ? null : streaks.pop
        }
      });

      inverseRow.forEach((item, i) => {
        $(`#${item}`).css({
          'background-color': 'gray'
        })
      });
    }

    break;
  }

  row = [tile]
  inverseRow = [inverseTile]
  iterations = 0
  checkTile = tile

  //left, right <->
  while (true) {
    iterations++
    if (iterations > 200) {
      console.log("overflow")
      break;
    }
    // console.log('tile: ' + gameBoard[tile])

    if (gameBoard[checkTile - 1] == letter && left) {
      // console.log("Checking tile : "+(checkTile-9)+ " Value: " + gameBoard[checkTile-9])
      console.log("left")
      checkTile -= 1
      row.push(checkTile)
      continue;
    } else if (left) {
      checkTile = tile
      left = false
    }


    if (gameBoard[checkTile + 1] == letter && right) {
      console.log("right")

      checkTile += 1
      row.push(checkTile)

      continue;
    } else if (right) {
      checkTile = inverseTile
      right = false;
    }

    if (gameBoard[checkTile - 1] == letter && i_left) {
      // console.log("Checking tile : "+(checkTile-9)+ " Value: " + gameBoard[checkTile-9])
      console.log("i_left")

      checkTile -= 1
      inverseRow.push(checkTile)
      continue;
    } else if (i_left) {
      checkTile = inverseTile
      i_left = false;
    }

    if (gameBoard[checkTile + 1] == letter && i_right) {
      console.log("i_right")

      checkTile += 1
      inverseRow.push(checkTile)

      continue;
    } else if (i_right) {
      checkTile = inverseTile
      i_right = false;
    }

    if (row.length >= 3) {
      streaks.push(row)
      // isSubset( master, sub )
      streaks.forEach((streak, x) => {
        if(isSubset(row, streak)){
          streaks[x] = row
          streaks.length == 0 ? null : streaks.pop
        }
      });

      row.forEach((item, i) => {
        $(`#${item}`).css({
          'background-color': 'gray'
        })
      });
    }

    if (inverseRow.length >= 3) {
      streaks.push(inverseRow)
      // isSubset( master, sub )
      streaks.forEach((streak, x) => {
        if(isSubset(inverseRow, streak)){
          streaks[x] = inverseRow
          streaks.length == 0 ? null : streaks.pop
        }
      });

      inverseRow.forEach((item, i) => {
        $(`#${item}`).css({
          'background-color': 'gray'
        })
      });
    }

    break;
  }

  row = [tile]
  inverseRow = [inverseTile]
  iterations = 0
  checkTile = tile

  //up, down ||
  while (true) {
    iterations++
    if (iterations > 200) {
      console.log("overflow")
      break;
    }
    // console.log('tile: ' + gameBoard[tile])

    if (gameBoard[checkTile - 10] == letter && up) {
      // console.log("Checking tile : "+(checkTile-9)+ " Value: " + gameBoard[checkTile-9])
      console.log("up")
      checkTile -= 10
      row.push(checkTile)
      continue;
    } else if (up) {
      checkTile = tile
      up = false
    }


    if (gameBoard[checkTile + 10] == letter && down) {
      console.log("down")

      checkTile += 10
      row.push(checkTile)

      continue;
    } else if (down) {
      checkTile = inverseTile
      down = false;
    }

    if (gameBoard[checkTile - 10] == letter && i_up) {
      // console.log("Checking tile : "+(checkTile-9)+ " Value: " + gameBoard[checkTile-9])
      console.log("i_up")

      checkTile -= 10
      inverseRow.push(checkTile)
      continue;
    } else if (i_up) {
      checkTile = inverseTile
      i_up = false;
    }

    if (gameBoard[checkTile + 10] == letter && i_down) {
      console.log("i_down")

      checkTile += 10
      inverseRow.push(checkTile)

      continue;
    } else if (i_down) {
      checkTile = inverseTile
      i_down = false;
    }

    if (row.length >= 3) {
      streaks.push(row)
      // isSubset( master, sub )
      streaks.forEach((streak, x) => {
        if(isSubset(row, streak)){
          streaks[x] = row
          streaks.length == 0 ? null : streaks.pop
        }
      });

      row.forEach((item, i) => {
        $(`#${item}`).css({
          'background-color': 'gray'
        })
      });
    }

    if (inverseRow.length >= 3) {
      streaks.push(inverseRow)
      // isSubset( master, sub )
      streaks.forEach((streak, x) => {
        if(isSubset(inverseRow, streak)){
          streaks[x] = inverseRow
          streaks.length == 0 ? null : streaks.pop
        }
      });

      inverseRow.forEach((item, i) => {
        $(`#${item}`).css({
          'background-color': 'gray'
        })
      });
    }

    break;
  }


  socket.emit('postScore', {pts:streaks.length, player: isX, all:streaks});

  if(isX){
    $('#xpts').text(streaks.length)
  }else{
    $('#opts').text(streaks.length)
  }
}

function isSubset( arr1, arr2 )
{
    for (var i=0; i<arr2.length; i++)
    {
        if ( arr1.indexOf( arr2[i] ) == -1 )
        {
          return false;
        }
    }
    return true;
}
