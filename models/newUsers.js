const mongoose = require('mongoose')
const Schema = mongoose.Schema
const GetISTTime = require('../factories/getISTTime')

// Create user Schema and Model
const NewUserSchema = new Schema({

    emailId: {
        type: String,
        required: [true, "The computer couldn't process the emailId."]
    },

    password: {
        type: String,
        default: "1234"
    },

    rLId: {
        type: String,
        required: [true, "The computer couldn't process the rLId."]
    },

    userType: {
        type: String,
        default: null
    },

    locationData: {
        type: String,
        default: "0000"
    },

    firstName: {
        type: String,
        default: null
    },

    lastName: {
        type: String,
        default: null
    },

    otpChances: {
        type: Number,
        default: 5
    },

    isVerified: {
        type: Boolean,
        default: false
    },

    profilePicture: {
        type: String,
        default: null
    },

    googleId: {
        type: String,
        default: null
    },

    linkedinId: {
        type: String,
        default: null
    },

    googleProfileURL: {
        type: String,
        default: null
    },

    linkedinProfileURL: {
        type: String,
        default: null
    },

    professionalTitle: {
        type: String,
        default: null
    },

    arcCoins: {
        type: Number,
        default: 2000
    },

    mobileNo: {
        type: Number,
        default: null
    },

    whatsappNo: {
        type: Number,
        default: null
    },

    stateAndCountry: {
        type: String,
        default: "India"
    },

    time: {
        type : Date,
        default: GetISTTime()
    },
})

const NewUser = mongoose.model('rlusers', NewUserSchema)

module.exports = NewUser