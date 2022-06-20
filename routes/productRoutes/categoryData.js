"use strict"

// External dependencies
const Joi = require("joi")
const DataEncrypterAndDecrypter = require("../../factories/encryptDecrypt")

const NewCategory = require("../../models/newCategories")
const NewProduct = require("../../models/newProducts")
const CategoryNames = require("../../lib/categoryNames")
const NewCount = require("../../models/newCount")

const corsHeaders = require("../../lib/routeHeaders")

let getSubCategories = {
    method: "POST",
    path: "/api/categories/get-sub-categories",

    config: {
        cors: corsHeaders,
        auth: {
            strategy: "restricted",
        },
        tags: ["api"],
        validate: {
            payload: {
                requestData: Joi.string(),
                message: Joi.string(),
            },
        },
    },
    handler: async (request, h) => {
        let { requestData, message } = request.payload

        //
        // DECRYPT REQUEST DATA
        //
        let decryptedData = DataEncrypterAndDecrypter.decryptData(requestData)
        //
        // DECRYPT REQUEST DATA
        //

        /////// VALIDATE PAYLOAD //////////////////////////////////////
        let dataPassesValidation = false

        const schema = Joi.object().keys({
            categoryId: Joi.string().max(7).required(),
        })

        await Joi.validate(decryptedData, schema)
            .then(val => {
                dataPassesValidation = true
            })
            .catch(e => {
                console.error(e)
                return h.response(e)
            })
        /////// VALIDATE PAYLOAD //////////////////////////////////////

        const { rLId } = request.auth.credentials

        let dataToSendBack

        if (dataPassesValidation === true) {
            let { categoryId } = decryptedData

            let categoryName = CategoryNames[categoryId]

            await NewCategory[categoryName].find().then(res => {
                let subCategoriesArray = []

                res.map((item, i) => {
                    subCategoriesArray.push({
                        subCategoryId: item.subCategoryId,
                        subCategoryName: item.subCategoryName,
                    })
                })

                dataToSendBack = {
                    subCategoriesArray,
                }

                //
                // Encrypt data
                //
                dataToSendBack = {
                    responseData:
                        DataEncrypterAndDecrypter.encryptData(dataToSendBack),
                    message: "All units, dispatching sub-categories. Over.",
                }
                //
                // Encrypt data
                //
            })
        } else {
            dataToSendBack = {
                message: "Wrong data",
            }

            //
            // Encrypt data
            //
            dataToSendBack = {
                responseData:
                    DataEncrypterAndDecrypter.encryptData(dataToSendBack),
                message: "TOXIC_DATA_ACTIVATED>LOCATION_TRACKED>196.0.0.1",
            }
            //
            // Encrypt data
            //
        }
        return h.response(dataToSendBack)
    },
}

let getProductTypes = {
    method: "POST",
    path: "/api/categories/get-product-types",

    config: {
        cors: corsHeaders,
        auth: {
            strategy: "restricted",
        },
        tags: ["api"],
        validate: {
            payload: {
                requestData: Joi.string(),
                message: Joi.string(),
            },
        },
    },
    handler: async (request, h) => {
        let { requestData, message } = request.payload

        //
        // DECRYPT REQUEST DATA
        //
        let decryptedData = DataEncrypterAndDecrypter.decryptData(requestData)
        //
        // DECRYPT REQUEST DATA
        //

        // console.log(decryptedData)

        /////// VALIDATE PAYLOAD //////////////////////////////////////
        let dataPassesValidation = false

        const schema = Joi.object().keys({
            sCId: Joi.string()
                .max(7 + 1 + 7)
                .required(),
        })

        await Joi.validate(decryptedData, schema)
            .then(val => {
                dataPassesValidation = true
            })
            .catch(e => {
                console.error(e)
                return h.response(e)
            })
        /////// VALIDATE PAYLOAD //////////////////////////////////////

        const { rLId } = request.auth.credentials

        let dataToSendBack

        if (dataPassesValidation === true) {
            let { sCId } = decryptedData

            const getCategoryId = () => {
                const categoryId = sCId.split("-")
                return categoryId[0].toUpperCase()
            }

            const categoryId = getCategoryId()

            let categoryName = CategoryNames[categoryId]

            sCId = sCId.toUpperCase()

            await NewCategory[categoryName]
                .findOne({
                    subCategoryId: sCId,
                })
                .then(res => {
                    if (res) {
                        dataToSendBack = {
                            productTypes: res.productTypes,
                        }
                    } else {
                        dataToSendBack = {}
                    }

                    //
                    // Encrypt data
                    //
                    dataToSendBack = {
                        responseData:
                            DataEncrypterAndDecrypter.encryptData(
                                dataToSendBack
                            ),
                        message:
                            "Roger, chief, dispatching product types. Over.",
                    }
                    //
                    // Encrypt data
                    //
                })
        } else {
            dataToSendBack = {
                message: "Wrong data",
            }

            //
            // Encrypt data
            //
            dataToSendBack = {
                responseData:
                    DataEncrypterAndDecrypter.encryptData(dataToSendBack),
                message: "TOXIC_DATA_ACTIVATED>LOCATION_TRACKED>196.0.0.1",
            }
            //
            // Encrypt data
            //
        }
        return h.response(dataToSendBack)
    },
}

let getProductHierarchy = {
    method: "POST",
    path: "/api/categories/get-product-hierarchy",

    config: {
        cors: corsHeaders,
        auth: {
            strategy: "restricted",
            mode: "try",
        },
        tags: ["api"],
        validate: {
            payload: {
                requestData: Joi.string(),
                message: Joi.string(),
            },
        },
    },
    handler: async (request, h) => {
        let { requestData, message } = request.payload

        //
        // DECRYPT REQUEST DATA
        //
        let decryptedData = DataEncrypterAndDecrypter.decryptData(requestData)
        //
        // DECRYPT REQUEST DATA
        //

        // console.log(decryptedData)

        /////// VALIDATE PAYLOAD //////////////////////////////////////
        let dataPassesValidation = false

        const schema = Joi.object().keys({
            pId: Joi.string().max(32).required(),
        })

        await Joi.validate(decryptedData, schema)
            .then(val => {
                dataPassesValidation = true
            })
            .catch(e => {
                console.error(e)
                return h.response(e)
            })
        /////// VALIDATE PAYLOAD //////////////////////////////////////

        const { rLId } = request.auth.credentials

        let dataToSendBack

        if (dataPassesValidation === true) {
            let { pId } = decryptedData

            const getCategoryId = () => {
                const categoryId = pId.split("-")
                return categoryId[0].toUpperCase()
            }

            const categoryId = getCategoryId()

            let categoryName = CategoryNames[categoryId]

            pId = pId.toUpperCase()

            let sCId = pId.split("-")[0] + "-" + pId.split("-")[1]

            await NewCategory[categoryName]
                .findOne({
                    subCategoryId: sCId,
                })
                .then(res => {
                    if (res) {
                        let pTypes = res.productTypes
                        let subCategoryName = res.subCategoryName

                        pTypes.map((item, i) => {
                            let pTypeId =
                                pId.split("-")[0] +
                                "-" +
                                pId.split("-")[1] +
                                "-" +
                                pId.split("-")[2]

                            if (pTypeId === item.productTypeId) {
                                dataToSendBack = {
                                    productTypeName: item.productType,
                                    categoryName,
                                    subCategoryName,
                                }
                            }
                        })

                        // dataToSendBack = {
                        //     ...dataToSendBack[0]
                        // }
                    } else {
                        dataToSendBack = {}
                    }

                    //
                    // Encrypt data
                    //
                    dataToSendBack = {
                        responseData:
                            DataEncrypterAndDecrypter.encryptData(
                                dataToSendBack
                            ),
                        message:
                            "Roger, chief, dispatching product types. Over.",
                    }
                    //
                    // Encrypt data
                    //
                })
        } else {
            dataToSendBack = {
                message: "Wrong data",
            }

            //
            // Encrypt data
            //
            dataToSendBack = {
                responseData:
                    DataEncrypterAndDecrypter.encryptData(dataToSendBack),
                message: "TOXIC_DATA_ACTIVATED>LOCATION_TRACKED>196.0.0.1",
            }
            //
            // Encrypt data
            //
        }
        return h.response(dataToSendBack)
    },
}

let CategoryRoute = [getSubCategories, getProductTypes, getProductHierarchy]

module.exports = CategoryRoute
