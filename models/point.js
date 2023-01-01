const mongoose = require('mongoose')

const pointSchema = new mongoose.Schema({
    //point schema is a coordinate
    coordinateX: {
        type: Number
    },
    coordinateY: {
        type: Number
    },
    coordinateZ: {
        type: Number
    }
})

module.exports = mongoose.model('Point', pointSchema)