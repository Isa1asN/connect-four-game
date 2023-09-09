const playerRed = 'R';
const playerYellow = 'Y';
const empty = ' ';
let currPlayer = playerRed;
let gameOver = false;
const numRows = 6;
const numCols = 7;
const aiDepth = 0; 

const board = Array.from({ length: numRows }, () => Array(numCols).fill(empty));

// Function to create the game board UI
function createBoardUI() {
  const boardContainer = document.getElementById('board');
  // console.log(boardContainer)

  for (let r = 0; r < numRows; r++) {
    for (let c = 0; c < numCols; c++) {
      const tile = document.createElement('div');
      tile.className = 'tile';
      tile.dataset.row = r;
      tile.dataset.col = c;
      boardContainer.appendChild(tile);
    }
  }

  boardContainer.addEventListener('click', handleTileClick);
}

// Function to handle tile click (player move)
function handleTileClick(event) {
  if (gameOver) return;
  
  const col = event.target.dataset.col;
  const row = getEmptyRow(parseInt(col));
  if (row !== -1) {
    board[row][col] = currPlayer;
    updateBoardUI();
    if (checkWin(row, parseInt(col), currPlayer)) {
      endGame(currPlayer + '(you)' + ' win!');
      document.body.style.backgroundColor = currPlayer == playerYellow ? 'yellow' : 'red'
      document.body.style.transition = 'background-color 3s ease-in-out'
      return;
    }

    switchPlayer();
    if (currPlayer === playerYellow && !gameOver) {
      setTimeout(makeAiMove, 500); // Delay for better UX
    }
  }
}

// Function to make the AI move
function makeAiMove() {
  const bestMove = findBestMove(board, aiDepth);
  const row = getEmptyRow(bestMove);
  if (row !== -1) {
    board[row][bestMove] = playerYellow;
    updateBoardUI();
    if (checkWin(row, bestMove, playerYellow)) {
      endGame(playerYellow + '(the AI)' + ' wins!');
      document.body.style.backgroundColor = 'yellow'
      document.body.style.transition = 'background-color 3s ease-in-out'
    }
    switchPlayer();
  }
}

// Function to find the best move using minimax
function findBestMove(board, depth) {
  const aiPlayer = playerYellow;
  let bestMove = -1;
  let bestScore = -Infinity;

  for (let col = 0; col < numCols; col++) {
    const newRow = getEmptyRow(col);
    if (newRow !== -1) {
      board[newRow][col] = aiPlayer;
      const score = minimax(board, depth, false);
      board[newRow][col] = empty;

      if (score > bestScore) {
        bestScore = score;
        bestMove = col;
      }
    }
  }

  return bestMove;
}

// Minimax algorithm with alpha-beta pruning
function minimax(board, depth, isMaximizing, alpha = -Infinity, beta = Infinity) {
  if (depth === 0 || isGameOver()) {
    return evaluate(board);
  }

  const currentPlayer = isMaximizing ? playerYellow : playerRed;
  const opponent = isMaximizing ? playerRed : playerYellow;

  const validMoves = getValidMoves(board);

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const col of validMoves) {
      const newRow = getEmptyRow(col);
      board[newRow][col] = currentPlayer;
      const eval = minimax(board, depth - 1, false, alpha, beta);
      board[newRow][col] = empty;
      maxEval = Math.max(maxEval, eval);
      alpha = Math.max(alpha, eval);
      if (beta <= alpha) break; // Pruning
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const col of validMoves) {
      const newRow = getEmptyRow(col);
      board[newRow][col] = currentPlayer;
      const eval = minimax(board, depth - 1, true, alpha, beta);
      board[newRow][col] = empty;
      minEval = Math.min(minEval, eval);
      beta = Math.min(beta, eval);
      if (beta <= alpha) break; // Pruning
    }
    return minEval;
  }
}

// Function to evaluate the board state
function evaluate(board) {
  
  return 2;
}

// Function to check if the game is over
function isGameOver() {
  return checkWin() || isBoardFull();
}

// Function to check for a win
function checkWin(){
  // horizontal
  for (let r = 0; r < numRows; r++) {
    for (let c = 0; c < numCols - 3; c++) {
            if(board[r][c] != ' '){
              if ( board[r][c] == board[r][c+1] && board[r][c+1]== board[r][c+2] && board[r][c+2]==board[r][c+3]){
                  // setWinner(r, c)
                  return true
              }
            }
    }    
  }
  // vertical
  for(let c = 0; c < numCols; c++){
    for (let r = 0; r < numRows - 3; r++){
      if(board[r][c] != " "){
        if (board[r][c] == board[r+1][c] && board[r+1][c] == board[r+2][c] && board[r+2][c] == board[r+3][c]){
          // setWinner(r, c)
          return true;
        }
      }
    }
  }
  // anti diagonal
  for(let r= 0; r < numRows-3; r++){
    for(let c = 0; c < numCols -3; c++){
      if(board[r][c] != ' '){
        if(board[r][c] == board[r+1][c+1] && board[r+1][c+1] == board[r+2][c+2] && board[r+2][c+2]==board[r+3][c+3]){
          // setWinner(r, c)
          return true;
        }
      }
    }
  }
  // diagonal
  for(let r= 3; r < numRows; r++){
    for(let c = 0; c < numCols-3; c++){
      if(board[r][c] != ' '){
        if(board[r][c] == board[r-1][c+1] && board[r-1][c+1] == board[r-2][c+2] && board[r-2][c+2] == board[r-3][c+3]){
          // setWinner(r, c);
          return true;
        }
      }
    }
  }
}

// Function to check if the board is full
function isBoardFull() {
  return board.every(row => row.every(tile => tile !== empty));
}

// Function to get valid move columns
function getValidMoves(board) {
  return board[0].map((_, col) => col).filter(col => board[0][col] === empty);
}

// Function to get the next empty row in a column
function getEmptyRow(col) {
  for (let row = numRows - 1; row >= 0; row--) {
    if (board[row][col] === empty) {
      return row;
    }
  }
  return -1; // Column is full
}

// Function to switch players
function switchPlayer() {
  currPlayer = currPlayer === playerRed ? playerYellow : playerRed;
  const turnFlag = document.querySelector('.t-flag');
  turnFlag.style.backgroundColor = currPlayer === playerRed ? 'red' : 'yellow';
}

// Function to update the game board UI
function updateBoardUI() {
  const boardContainer = document.getElementById('board');

  for (let r = 0; r < numRows; r++) {
    for (let c = 0; c < numCols; c++) {
      const tile = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
      tile.className = 'tile';
      if (board[r][c] === playerRed) {
        tile.classList.add('red-piece');
      } else if (board[r][c] === playerYellow) {
        tile.classList.add('yellow-piece');
      }
    }
  }
}

function endGame(message) {
  const winner = document.getElementById('winner');
  winner.innerText = message;
  gameOver = true;
}


document.addEventListener('DOMContentLoaded', createBoardUI );
