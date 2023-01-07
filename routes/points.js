const express = require('express')
const req = require('express/lib/request')
const router = express.Router()
const Point = require('../models/point')

//creating our routes 

//getting all points 
router.get('/', async (req, res) => {
    try {
        const points = await Point.find()
        res.json(points)
    } catch (err) {
        //500 server error
        res.status(500).json( {message: err.message} )
    }
})

//get by mongoose id. id is a parameter -- not part of a query string
router.get('/:id', async (req, res) => {
    try {
        const point = await Point.findOne({
            _id: req.params.id
        })
        res.json(point)
    } catch (err) {
        res.status(500).json( {message: err.message} )
    }

})

//adding one point 
router.post('/', async(req, res) => {
    const point = new Point({
        coordinateX: req.body.coordinateX,
        coordinateY: req.body.coordinateY,
        coordinateZ: req.body.coordinateZ
    })
    try {
        const newPoint = await point.save()
        //201 successful creation
        res.status(201).json(newPoint)
    } catch (err) {
        //400 user error
        res.status(400).json( {message: err.message} )
    }
})

//deleting, clearing database
router.delete('/', async(req, res) => {
    try {
        await Point.deleteMany()
        const points = await Point.find()
        res.json(points)
    } catch (err) {
        res.status(500).json( {message: err.message} )
    }
})

module.exports = router