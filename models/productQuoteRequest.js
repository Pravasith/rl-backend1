const mongoose = require('mongoose')
const Schema = mongoose.Schema

const GetISTTime = require('../factories/getISTTime')

// Create product schema and Model
const NewProductQuoteSchema = new Schema({

    emailId: {
        type: String,
        required: [true, "The computer couldn't process the emailId."]
    },

    name: {
        type: String,
        default: null
    },

    mobileNo: {
        type: Number,
        default: null
    },

    callTimings: {
        type : String,
        default : null
    },

    productLink : {
        type : String,
        default : null
    },

    productData : {
        type : Object,
        required: [true, "The computer couldn't process the productData."]
    },

    time: {
        type : Date,
        default: GetISTTime()
    },
})

const NewProductQuote = mongoose.model('product-quote', NewProductQuoteSchema)

module.exports = NewProductQuote