var playerRed = 'R'
var playerYellow = 'Y'
var currPlayer = playerRed

var gameOver = false
var board
var currColRowInd

var rows = 6
var columns = 7

window.onload = function(){
  setGame()
}
function setGame(){
  board = []
  currColRowInd = [5, 5, 5, 5, 5, 5, 5] 
  for (let r = 0; r < rows; r++) {
    let row = []
    for (let c = 0; c < columns; c++){
      row.push(' ')

      let tile = document.createElement('div')
      tile.id = r.toString() + '-' +c.toString()
      tile.classList.add('tile')
      tile.addEventListener('click', setPiece)
      document.getElementById('board').append(tile)
    }
    board.push(row)
    
  }
}

function setPiece(){
  if (gameOver){
    return;
  }

  let coords = this.id.split('-')
  let r = parseInt(coords[0])
  let c = parseInt(coords[1])

  r = currColRowInd[c]
  if(r<0){
    return;
  }

  board[r][c] = currPlayer
  let tile = document.getElementById(`${r}-${c}`)
  if(currPlayer == playerRed){
    tile.classList.add('red-piece')
    currPlayer = playerYellow
  }
  else{
    tile.classList.add('yellow-piece')
    currPlayer = playerRed
  }
  currColRowInd[c] -= 1
}