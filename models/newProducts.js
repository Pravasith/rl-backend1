const mongoose = require('mongoose')
const Schema = mongoose.Schema

// Create product schema and Model
const NewProductSchema = new Schema({

    rLId: {
        type: String,
        required: [true, "The computer couldn't process the rLId."]
    },

    productId: {
        type: String,
        required: [true, "The computer couldn't process the product id."]
    },

    productName: {
        type: String,
        default: null,
    },

    product_lowerCased_name: {
        type: String,
        default: null,
    },

    productCode: {
        type: String,
        default: null,
    },

    basePrice: {
        type: Number,
        default: null,
    },

    priceNotation: {
        type: Number,
        default: null
    },

    gstPercentage : {
        type: Number,
        default: 0,
    },

    productMaterials: {
        type: Array,
        default: [],
    },

    finishingOptions: {
        type: Array,
        default: []
    },

    colorOptions: {
        type: Array,
        default: []
    },

    sizesAvailable: {
        type: Array,
        default: []
    },

    minQuantity: {
        type: Number,
        default: null,
    },

    maxQuantity: {
        type: Number,
        default: null,
    },

    productDescription: {
        type: String,
        default: null
    },

    features: {
        type: Array,
        default: []
    },

    designStyles: {
        type: Array,
        default: []
    },

    tags: {
        type: Array,
        default: []
    },

    availability: {
        type: Boolean,
        default: true,
    },

    productRating: {
        type: Number,
        default: null,
    },

    discount: {
        type: Number,
        default: null,
    },

    productThumbImage: {
        type: String,
        default: null
    },

    productImages : {
        type: Array,
        default: []
    },

    brandName : {
        type: String,
        default: null
    },

    brandImage: {
        type: String,
        default: null
    },

    youTubeAdVideos : {
        type: Array,
        default: []
    },

    productInstallers: {
        type: Array,
        default: []
    },

    productInstallationAvailability: {
        type : Number,
        default : null
    },

    productInstallationServiceCost: {
        type : Number,
        default : null
    },
    
    installationServiceCostType: {
        type : Number,
        default : null
    },

    viewedPeople : {
        type : Array,
        default : []
    },

    viewsOverall : {
        type: Number,
        default : 0
    },

    time: {
        type : Date,
        default: Date.now
    },
})

const NewProduct = mongoose.model('product', NewProductSchema)

module.exports = NewProduct