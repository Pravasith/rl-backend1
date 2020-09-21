const mongoose = require('mongoose')
const Schema = mongoose.Schema

// Create product schema and Model
const NewTrendingProductsSchema = new Schema({

    categoryId: {
        type : String,
        required: [true, "The computer couldn't process the category."]
    },

    categoryName: {
        type : String,
        default : null
    },

    trending200: {
        type : Array,
        default : []
    },

    time: {
        type : Date,
        default: Date.now
    }
})

const NewTrendingProducts = mongoose.model('new-trending-product', NewTrendingProductsSchema)

module.exports = NewTrendingProducts