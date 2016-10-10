'use strict'

const socket = io()

const board = document.querySelector('.board')
const points = document.querySelector('.points')

const buildBoard = thisBoard => {
  board.innerHTML = `
    <table>
      <tr>
        <td>${thisBoard[0][0]}</td>
        <td>${thisBoard[0][1]}</td>
        <td>${thisBoard[0][2]}</td>
        <td>${thisBoard[0][3]}</td>
      </tr>
      <tr>
        <td>${thisBoard[1][0]}</td>
        <td>${thisBoard[1][1]}</td>
        <td>${thisBoard[1][2]}</td>
        <td>${thisBoard[1][3]}</td>
      </tr>
      <tr>
        <td>${thisBoard[2][0]}</td>
        <td>${thisBoard[2][1]}</td>
        <td>${thisBoard[2][2]}</td>
        <td>${thisBoard[2][3]}</td>
      </tr>
      <tr>
        <td>${thisBoard[3][0]}</td>
        <td>${thisBoard[3][1]}</td>
        <td>${thisBoard[3][2]}</td>
        <td>${thisBoard[3][3]}</td>
      </tr>
      
    </table>
  `
}



const buildPoints = ( player1Points, player2Points ) => {
  points.innerHTML = `player 1 points: ${player1Points} | player 2 points: ${player2Points}`
}

const endGame = game => {
  points.innerHTML += 'game over'
  // game.gameOver = true
}

const buildPage = ({ visibleBoard, player1Points, player2Points }) => {
  buildBoard(visibleBoard)
  buildPoints(player1Points, player2Points)
}

board.addEventListener('click', evt => {
  const col = evt.target.cellIndex
  const row = evt.target.closest('tr').rowIndex

  socket.emit('guess made', { row, col })
})

socket.on('connect', () => console.log(`Socket connected: ${socket.id}`))
socket.on('disconnect', () => console.log('Socket disconnected'))
socket.on('error', console.error)
socket.on('game over', game => endGame(game))
socket.on('guess complete',  game => buildPage(game))
socket.on('new game', game => buildPage(game))

// // // TO DO // // //

// end game when all matches complete 
// // 'congrats player X wins'
// // // could store 'currentPlayer' on game object
// // // switch on match failure

// make multiplayer logic ( take turns upon match failure )
