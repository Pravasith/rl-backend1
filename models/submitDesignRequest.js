const mongoose = require('mongoose')
const Schema = mongoose.Schema
const GetISTTime = require('../factories/getISTTime')

// Create product schema and Model
const SubmitDesignRequestSchema = new Schema({

    name: {
        type: String,
        default: null
    },

    emailId: {
        type: String,
        required: [true, "The computer couldn't process the emailId."]
    },

    mobileNo: {
        type: Number,
        default: null
    },

    referenceImages: {
        type : Array,
        default: []
    },

    time: {
        type : Date,
        default: GetISTTime()
    },
})

const SubmitDesignRequest = mongoose.model('custom-design-procurement-request', SubmitDesignRequestSchema)

module.exports = SubmitDesignRequest