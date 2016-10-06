'use strict'

const socket = io()

const board = document.querySelector('.board')

var selected = []

board.addEventListener('click', evt => {
  const col = evt.target.cellIndex
  const row = evt.target.closest('tr').rowIndex
  const selection = evt.target.innerHTML;

  console.log('click: ', col, row, selection)
  console.log("selection: ", selected);
  selected.push(selection)
  console.log("selection: ", selected);
})

socket.on('connect', () => console.log(`Socket connected: ${socket.id}`))
socket.on('disconnect', () => console.log('Socket disconnected'))
socket.on('error', console.error)
