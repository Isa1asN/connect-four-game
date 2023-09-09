const playerRed = 'R';
const playerYellow = 'Y';
const empty = ' ';
let currPlayer = playerRed;
let gameOver = false;
const numRows = 6;
const numCols = 7;
const aiDepth = 4; 

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
      endGame('You' + ' win!');
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
      endGame('The AI' + ' wins!');
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
  const aiPlayer = playerYellow;
  const opponent = playerRed;

  // Evaluate threats and positions for both AI and opponent
  const aiThreats = evaluateThreats(board, aiPlayer);
  const opponentThreats = evaluateThreats(board, opponent);
  const aiPosition = evaluatePosition(board, aiPlayer);
  const opponentPosition = evaluatePosition(board, opponent);

  // Calculate the final score based on threats and positions
  const aiScore = aiThreats * 100 + aiPosition;
  const opponentScore = opponentThreats * 100 + opponentPosition;

  // Return the difference between AI and opponent scores
  return aiScore - opponentScore;
}

// Function to evaluate threats on the board
function evaluateThreats(board, player) {
  let threatScore = 0;

  // Define the player's piece and the opponent's piece
  const playerPiece = player;
  const opponentPiece = player === playerRed ? playerYellow : playerRed;

  // Check horizontally for threats
  for (let r = 0; r < numRows; r++) {
    for (let c = 0; c < numCols - 3; c++) {
      const window = board[r].slice(c, c + 4); // Get a window of 4 columns
      const playerCount = window.filter(piece => piece === playerPiece).length;
      const opponentCount = window.filter(piece => piece === opponentPiece).length;

      if (playerCount === 4) {
        return Infinity;
      } else if (playerCount === 3 && opponentCount === 0) {
        threatScore += 100;
      } else if (playerCount === 2 && opponentCount === 0) {
        threatScore += 10;
      } else if (playerCount === 1 && opponentCount === 0) {
        threatScore += 1;
      }
    }
  }

  // Check vertically for threats
  for (let c = 0; c < numCols; c++) {
    for (let r = 0; r < numRows - 3; r++) {
      const window = board.slice(r, r + 4).map(row => row[c]); // Get a window of 4 rows
      const playerCount = window.filter(piece => piece === playerPiece).length;
      const opponentCount = window.filter(piece => piece === opponentPiece).length;

      if (playerCount === 4) {
        return Infinity;
      } else if (playerCount === 3 && opponentCount === 0) {
        threatScore += 100;
      } else if (playerCount === 2 && opponentCount === 0) {
        threatScore += 10;
      } else if (playerCount === 1 && opponentCount === 0) {
        threatScore += 1;
      }
    }
  }

  // Check diagonally for threats (top-left to bottom-right)
  for (let r = 0; r < numRows - 3; r++) {
    for (let c = 0; c < numCols - 3; c++) {
      const window = Array.from({ length: 4 }, (_, i) => board[r + i][c + i]);
      const playerCount = window.filter(piece => piece === playerPiece).length;
      const opponentCount = window.filter(piece => piece === opponentPiece).length;

      if (playerCount === 4) {
        return Infinity;
      } else if (playerCount === 3 && opponentCount === 0) {
        threatScore += 100;
      } else if (playerCount === 2 && opponentCount === 0) {
        threatScore += 10;
      } else if (playerCount === 1 && opponentCount === 0) {
        threatScore += 1;
      }
    }
  }

  // Check diagonally for threats (top-right to bottom-left)
  for (let r = 0; r < numRows - 3; r++) {
    for (let c = 3; c < numCols; c++) {
      const window = Array.from({ length: 4 }, (_, i) => board[r + i][c - i]);
      const playerCount = window.filter(piece => piece === playerPiece).length;
      const opponentCount = window.filter(piece => piece === opponentPiece).length;

      if (playerCount === 4) {
        return Infinity;
      } else if (playerCount === 3 && opponentCount === 0) {
        threatScore += 100;
      } else if (playerCount === 2 && opponentCount === 0) {
        threatScore += 10;
      } else if (playerCount === 1 && opponentCount === 0) {
        threatScore += 1;
      }
    }
  }

  return threatScore;
}


// Function to evaluate the position of pieces on the board
function evaluatePosition(board, player) {
  let positionScore = 0;

  // Evaluate the position of pieces on the board
  // Assigning higher scores to pieces in the center columns
  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numCols; col++) {
      if (board[row][col] === player) {
        // Assign higher scores to pieces in the center columns
        if (col >= 2 && col <= 4) {
          positionScore += 2;
        } else {
          positionScore += 1;
        }
      }
    }
  }

  return positionScore;
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
  const board = document.getElementById('board');
  board.style.opacity = 0.3
}


document.addEventListener('DOMContentLoaded', createBoardUI );
