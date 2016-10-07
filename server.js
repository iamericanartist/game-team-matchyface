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
    ],
    default: 
      [['1', '2', '3', '4'],
      ['8', '7', '6', '5'],
      ['2', '1', '4', '3'],
      ['8', '7', '6', '5']]
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
  }
})

app.set('view engine', 'pug')

app.use(express.static('public'))

app.get('/', (req, res) => res.render('index'))

app.get('/game/list', (req, res) => {
  // res.render('list')
  Game.find()
  .then(games => res.render('list', { games }))
})

app.get('/game/create', (req, res) => {
  Game.create({
    boardKey: [['1', '2', '3', '4'],
      ['8', '7', '6', '5'],
      ['2', '1', '4', '3'],
      ['8', '7', '6', '5']],
    successfulMatches: 0
  })
  .then(game => res.redirect(`/game/${game._id}`))
  .catch( console.error)
  // res.render('game')
})

app.get('/game/:gameId', (req, res) => {
  Game.findById(req.params.gameId)
  .then(game => res.render('game', { game }))
})


let selectedArray = []

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

  socket.on('guess made', ({ row, col }) => {
    // console.log('guess object', guessObject)
    // console.log('socket game id: ', socket.gameId)
    Game.findById(socket.gameId)
    .then(game => {
      // console.log('game: ', game)
      selectedArray.push(game.boardKey[row][col])
      game.visibleBoard[row][col] = game.boardKey[row][col]
      game.markModified('visibleBoard')
      game.save()
      // console.log('selectedArray', selectedArray)
      socket.emit('guess complete', game)
      if ( !!selectedArray[1] ) {
        takeGuess(game, selectedArray)
        selectedArray = []
      }
    })
  })

  socket.on('disconnect', () => console.log(`Socket disconnected: ${socket.id}`))
})

mongoose.Promise = Promise
mongoose.connect(MONGODB_URL, () => {
  server.listen(PORT, () => console.log(`Server listening on port: ${PORT}`))
})

const takeGuess = ( game, selected ) => {
  if(checkMatch(selected)) {
    game.solvedBoard = game.visibleBoard;
    game.successfulMatches++
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