const mongoose = require("mongoose")
const Schema = mongoose.Schema

const GetISTTime = require("../factories/getISTTime")

// Create product schema and Model
const NewVendorOnboardSchema = new Schema({
    emailId: {
        type: String,
        required: [true, "The computer couldn't process the emailId."],
    },

    name: {
        type: String,
        default: null,
    },

    mobileNo: {
        type: Number,
        default: null,
    },

    requestType: {
        type: String,
        default: "vendorOnboard",
    },

    time: {
        type: Date,
        default: GetISTTime(),
    },
})

const NewVendorOnboard = mongoose.model(
    "onboard-vendor",
    NewVendorOnboardSchema
)

module.exports = NewVendorOnboard
