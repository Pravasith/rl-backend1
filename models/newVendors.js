const mongoose = require('mongoose')
const Schema = mongoose.Schema

const GetISTTime = require('../factories/getISTTime')

// Create user Schema and Model
const NewVendorSchema = new Schema({

    rLId: {
        type: String,
        required: [true, "The computer couldn't process the rLId."]
    },

    lifeCycleStage : {
        // 1 = first time user
        // 2 = login details filled
        type: Number,
        default: 1 
    },

    companyName: {
        type: String,
        default: null
    },

    products: {
        type: Array,
        default: []
    },

    address: {
        hNo: {
            type: String,
            default: null
        },

        stNo: {
            type: String,
            default: null
        },

        detailedAddressLine1: {
            type: String,
            default: null
        },

        detailedAddressLine2: {
            type: String,
            default: null
        },

        state: {
            type: String,
            default: null
        },

        city: {
            type: String,
            default: null
        },

        pincode: {
            type: Number,
            default: 000000
        },
    },

    companyDescriptionLine1: {
        type: String,
        default: null,
    },

    companyDescriptionLine2 : {
        type: String,
        default: null
    },

    experience: {
        years: {
            type: String,
            default: null
        },

        months: {
            type: String,
            default: null
        }
    },

    GSTIN: {
        type: String,
        default: null
    },

    PAN: {
        type: String,
        default: null
    },

    companyProfilePicture: {
        type: String,
        default : null
    },
    
    time: {
        type : Date,
        default: GetISTTime()
    },
})

const NewVendor = mongoose.model('vendor', NewVendorSchema)

module.exports = NewVendor

