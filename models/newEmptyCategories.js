const mongoose = require('mongoose')
const Schema = mongoose.Schema


// Create product schema and Model
const NewEmptyCategoriesSchema = new Schema({

    allCategories: {
        type: Array,
        default: []
    },

    categoryWholeData: {
        type: String,
        default: "all-cats-sCats-pTypes-incl-pCount"
    },

    time: {
        type : Date,
        default: Date.now
    },
})

const NewEmptyCategories = mongoose.model('empty-categorie', NewEmptyCategoriesSchema)

module.exports = NewEmptyCategories