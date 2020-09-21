const mongoose = require('mongoose')
const Schema = mongoose.Schema

// Create product schema and Model
const NewCountSchema = new Schema({

    categoryCount: {
        type: Number,
        default: 0,
    },

    subCategoryCount: {
        type: Number,
        default: 0,
    },

    productTypeCount: {
        type: Number,
        default: 0,
    },

    productCount: {
        type: Number,
        default: 0,
    },

})

const NewCount = mongoose.model('count-number', NewCountSchema)

module.exports = NewCount