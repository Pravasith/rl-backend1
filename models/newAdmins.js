const mongoose = require("mongoose")
const Schema = mongoose.Schema
const GetISTTime = require("../factories/getISTTime")

// Create product schema and Model
const NewAdminSchema = new Schema({
    adminName: {
        type: String,
        default: null,
    },

    adminPassword: {
        type: String,
        default: null,
    },

    adminId: {
        type: String,
        default: null,
    },

    adminEmail: {
        type: String,
        default: null,
    },

    adminAlternateEmail: {
        type: String,
        default: null,
    },

    adminMobile: {
        type: Number,
        default: null,
    },

    time: {
        type: Date,
        default: Date.now,
    },
})

const NewAdmin = mongoose.model("admin-database", NewAdminSchema)

module.exports = NewAdmin
