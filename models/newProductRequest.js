const mongoose = require("mongoose")
const Schema = mongoose.Schema

const GetISTTime = require("../factories/getISTTime")
// Create product schema and Model
const AskForProductsSchema = new Schema({
    name: {
        type: String,
        default: null,
    },

    productName: {
        type: String,
        default: null,
    },

    mobileNo: {
        type: Number,
        default: null,
    },

    referenceImages: {
        type: Array,
        default: [],
    },

    time: {
        type: Date,
        default: GetISTTime(),
    },
})

const AskForProducts = mongoose.model("ask-for-product", AskForProductsSchema)

module.exports = AskForProducts
