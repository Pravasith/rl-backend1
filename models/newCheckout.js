const mongoose = require("mongoose")
const Schema = mongoose.Schema

// Create product schema and Model
const NewCheckoutSchema = new Schema({
    rLId: {
        type: String,
        required: [true, "The computer couldn't process the rLId."],
    },

    emailId: {
        type: String,
        required: [true, "The computer couldn't process the emailId."],
    },

    firstName: {
        type: String,
        required: true,
    },

    lastName: {
        type: String,
        default: null,
    },

    mobileNo: {
        type: Number,
        default: null,
    },

    addresses: {
        type: Array,
        default: [],
    },

    cartData: {
        type: Array,
        default: [],
    },

    time: {
        type: Date,
        default: Date.now,
    },
})

const NewCheckout = mongoose.model("product", NewCheckoutSchema)

module.exports = NewCheckout
