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



const buildPoints = pointCount => {
  points.innerHTML = `points: ${pointCount}`
  // 
  // 
}

const buildPage = ({ visibleBoard, successfulMatches }) => {
  buildBoard(visibleBoard)
  buildPoints(successfulMatches)
}

board.addEventListener('click', evt => {
  const col = evt.target.cellIndex
  const row = evt.target.closest('tr').rowIndex

  socket.emit('guess made', { row, col })
})

socket.on('connect', () => console.log(`Socket connected: ${socket.id}`))
socket.on('disconnect', () => console.log('Socket disconnected'))
socket.on('error', console.error)
socket.on('guess complete',  game => buildPage(game))
socket.on('new game', game => buildPage(game))

// // // TO DO // // //

// end game when all matches complete 
// // 'congrats player X wins'
// // // could store 'currentPlayer' on game object
// // // switch on match failure

// make multiplayer logic ( take turns upon match failure )
// // joinable by sharing link or by waiting

// randomly generate boardKey upon creation
// // can be from array or other pre-populated
// // for non number values
// // // ( image matching, etc )