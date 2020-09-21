const mongoose = require('mongoose')
const Schema = mongoose.Schema

const GetISTTime = require('../factories/getISTTime')

// Create product schema and Model
const NewSubCategoryAnalyticsSchema = new Schema({

    isSubCat: {
        type: Boolean,
        default : true
    },

    fetchId: {
        type: String,
        default: null
    },

    subCategoryName: {
        type: String,
        default: null
    },

    categoryName: {
        type: String,
        default: null
    },

    productTypeName: {
        type: String,
        default: null
    },

    viewCount: {
        type: Number,
        default: 1
    },

    datesViewed : {
        type: Array,
        default : []
    },

    time: {
        type : Date,
        default: GetISTTime()
    },
})

const NewSubCategoryAnalytics = mongoose.model('sub-category-analytics', NewSubCategoryAnalyticsSchema)

module.exports = NewSubCategoryAnalytics