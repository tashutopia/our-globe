const express = require('express')
const { default: mongoose } = require('mongoose')
const app = express()
const path = require('path')

const uri = 'mongodb+srv://joyying:ourGlobeAdmin@cluster0.uxnaltg.mongodb.net/?retryWrites=true&w=majority'

//public contains public html
app.use(express.static(__dirname + '/public'))
app.use('/build/', express.static(path.join(__dirname, 'node_modules/three/build')))
app.use('/jsm/', express.static(path.join(__dirname, 'node_modules/three/examples/jsm')))
app.use('/gsap/', express.static(path.join(__dirname, 'node_modules/gsap')))

//let server accept json
app.use(express.json())

//function to connect to mongodb
mongoose.connect(uri)
const db = mongoose.connection

//event listeners through mongoose
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('Connected to database!'))

//create router
const pointsRouter = require('./routes/points')
app.use('/points', pointsRouter) //use pointsRouter whenever /points


app.listen(3000, () => console.log('Visit http://127.0.0.1:3000'))
