const mongoose = require("mongoose")
const Schema = mongoose.Schema

// Create subscriber schema and Model
const NewSubscriberSchema = new Schema({
    name: {
        type: String,
        default: null,
    },

    emailId: {
        type: String,
        default: null,
    },

    mobile: {
        type: Number,
        default: null,
    },

    time: {
        type: Date,
        default: Date.now,
    },
})

const NewSubscriber = mongoose.model("subscriber-database", NewSubscriberSchema)

module.exports = NewSubscriber
