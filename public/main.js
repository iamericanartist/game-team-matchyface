'use strict'

const socket = io()

const PORT = process.env.PORT || 3000
const MONGODB_URL =  process.env.MONGODB_URL || "mongodb://localhost:27017/matchymcmatcherfacepi"

app.set('view engine', 'pug')

app.use(express.static('public'))

mongoose.Promise = Promise
mongoose.connect(MONGODB_URL, () => {
  server.listen(PORT, () => console.log(`Server listening on port: ${PORT}`))
})
