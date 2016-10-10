"use strict"

/////////////////////////////  BASIC SERVER SETUP  /////////////////////////////
const express = require("express")
const { Server } = require("http")
const mongoose = require("mongoose")
const socketio = require("socket.io")

const app = express()
const server = Server(app)
const io = socketio(server)

const PORT = process.env.PORT || 3000
const MONGODB_URL =  process.env.MONGODB_URL || "mongodb://localhost:27017/matchymcmatcherfacepi"

const Game = mongoose.model('game', {
  boardKey: { type: [
      [ String, String, String, String],
      [ String, String, String, String],
      [ String, String, String, String],
      [ String, String, String, String]
    ]
  },
  solvedBoard: { type: [
      [ String, String, String, String],
      [ String, String, String, String],
      [ String, String, String, String],
      [ String, String, String, String]
    ],
    default: 
      [['', '', '', ''],
      ['', '', '', ''],
      ['', '', '', ''],
      ['', '', '', '']]
  },
  visibleBoard: { type: [
      [ String, String, String, String],
      [ String, String, String, String],
      [ String, String, String, String],
      [ String, String, String, String]
    ],
    default: 
      [['', '', '', ''],
      ['', '', '', ''],
      ['', '', '', ''],
      ['', '', '', '']]
  },
  successfulMatches: {
    type: Number,
    default: 0
  },
  player: {
    type: Boolean,
    default: true
  },
  gameOver: {
    type: Boolean,
    default: false
  }
})

app.set('view engine', 'pug')

app.use(express.static('public'))

// // // *** ROUTING *** // // //

app.get('/', (req, res) => res.render('index'))

app.get('/game/list', (req, res) => {
  Game.find()
  .then(games => res.render('list', { games }))
})


app.get('/game/create', (req, res) => {
  Game.create({
    boardKey: rebuildArray()
    // boardKey: []
  })
  .then(game => res.redirect(`/game/${game._id}`))
  .catch( console.error)
  // res.render('game')
})



function rebuildArray(boardKey) {
  boardKey = [
   '1', '2', '3', '4',
   '8', '7', '6', '5',
   '2', '1', '4', '3',
   '8', '7', '6', '5'
      ]
    let newArray = []
      for (var i = boardKey.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = boardKey[i];
        boardKey[i] = boardKey[j];
        boardKey[j] = temp;
    }
      var i,j,temparray,chunk = 4;
      for (i=0,j=boardKey.length; i<j; i+=chunk) {
      temparray = boardKey.slice(i,i+chunk);
      newArray.push(temparray)
    console.log('temparray', temparray);
}
return newArray
}
rebuildArray()


app.get('/game/:gameId', (req, res) => {
  Game.findById(req.params.gameId)
  .then(game => res.render('game', { game }))
})

let selectedArray = []


// // // *** SOCKET.IO *** // // //

io.on('connect', socket => {
  console.log(`Socket connected: ${socket.id}`)

  const id = socket.handshake.headers.referer.split('/').slice(-1)[0]

  Game.findById(id)
  .then(g => {
    socket.join(g._id)
    socket.gameId = g._id
    socket.emit('new game', g)
  })
  .catch(err => {
    socket.emit('error', err)
    console.error(err)
  })

  socket.on('guess made', ({ row, col }) => takeGuess(row, col, socket))
  socket.on('disconnect', () => console.log(`Socket disconnected: ${socket.id}`))
})

mongoose.Promise = Promise
mongoose.connect(MONGODB_URL, () => {
  server.listen(PORT, () => console.log(`Server listening on port: ${PORT}`))
})

// // // *** FUNCTIONS *** // // //

const takeGuess = ( row, col, socket ) => {
  Game.findById(socket.gameId)
    .then(game => {
      if(game.gameOver) {
        return console.log('game is over')
      }
      selectedArray.push(game.boardKey[row][col])
      game.visibleBoard[row][col] = game.boardKey[row][col]
      game.markModified('visibleBoard')
      game.save()
      console.log('points: ', game.successfulMatches)
      socket.emit('guess complete', game)
      if ( !!selectedArray[1] ) {
        reviewMatch(game, selectedArray)
        checkGameOver(game, socket)
        selectedArray = []
      }
    })
}

const checkGameOver = ( game, socket ) => {
  // console.log('hella game check', game)
  if( game.successfulMatches === 8 ) {
    console.log('game over', game)
    socket.emit('game over', game)
    killGame(game)
    return
  }
  console.log('no win', game)
  return 
}

const killGame = game => {
  console.log('kill the game')
  Game.findById(game._id)
  .then(game => {
    console.log('killed game', game)
  })
}

const reviewMatch = ( game, selected ) => {
  if(checkMatch(selected)) {
    game.solvedBoard = game.visibleBoard;
    game.successfulMatches++
    console.log('points: ', game.successfulMatches)

    game.save() 
  } else {
    game.visibleBoard = game.solvedBoard
    game.markModified('visibleBoard')
    game.save()
  }
}

const checkMatch = match => {
  if(match[0] === match[1]) {
    return true
  } 
  return false
}
