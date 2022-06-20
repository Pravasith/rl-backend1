"use strict"

// External dependencies
const Joi = require("joi")

// Internal dependencies
const NewUser = require("../../models/newUsers")
const VendorDetail = require("../../models/newVendors")
const ProductQuoteRequest = require("../../models/productQuoteRequest")

const DataEncrypterAndDecrypter = require("../../factories/encryptDecrypt")

const corsHeaders = require("../../lib/routeHeaders")

let newProductQuoteRequest = {
    method: "POST",
    path: "/api/enquiry/product-quote-request",

    config: {
        cors: corsHeaders,
        tags: ["api"],
        auth: {
            strategy: "restricted",
            mode: "try",
        },
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
            name: Joi.string().max(100).required(),
            emailId: Joi.string().email({ minDomainAtoms: 2 }).required(),
            mobileNo: Joi.number().integer().max(9999999999).required(),
            callTimings: Joi.string().max(100).required(),
            productLink: Joi.string().max(9000).required(),
            productData: Joi.object().keys({
                productName: Joi.string().max(200).required(), // verified frontend
                productCode: Joi.string().max(30).required(), // verified frontend
                basePrice: Joi.number()
                    .integer()
                    .max(99999999)
                    .required()
                    .allow(null), // verified frontend
                gstPercentage: Joi.number().max(100).required(), // verified frontend

                // Custom options
                productMaterial: Joi.object()
                    .keys({
                        materialCost: Joi.number()
                            .integer()
                            .max(99999999)
                            .required(), // verified frontend
                        materialName: Joi.string().max(60).required(), // verified frontend
                        materialGrade: Joi.string().max(30).allow(null, ""), // verified frontend
                    })
                    .required(), // verified frontend

                finishingOption: Joi.object().keys({
                    finishName: Joi.string().max(30).required(), // verified frontend
                    finishCode: Joi.string().max(30).allow(null, ""), // verified frontend
                    finishImage: Joi.string().required(), // verified frontend
                    finishCost: Joi.number().max(99999999), // verified frontend
                }), // verified frontend

                colorOption: Joi.object().keys({
                    colorName: Joi.string().max(30).required(), // verified frontend
                    colorCode: Joi.string().max(7).required(), // verified frontend
                    colorCost: Joi.number().max(99999999), // verified frontend
                }), // verified frontend

                size: Joi.object().keys({
                    sizeName: Joi.string().max(100), // verified frontend
                    sizeCost: Joi.number().max(99999999), // verified frontend
                }), // verified frontend

                quantity: Joi.number().max(99999999).required(), // verified frontend

                productId: Joi.string().max(80).required(),
                discount: Joi.number().max(100).required(), // verified frontend
                productImages: Joi.array()
                    .items(
                        Joi.object().keys({
                            itemCode: Joi.string()
                                .max(100)
                                .allow(null, "")
                                .required(), // verified frontend
                            textOnRibbonSatisfied: Joi.boolean().required(), // verified frontend
                            imageURL: Joi.string().max(2048).required(), // verified frontend
                        })
                    )
                    .required(), // verified frontend
                productThumbImage: Joi.string().max(2048).required(), // verified frontend
                brandName: Joi.string().max(30).allow(null, ""),
                brandImage: Joi.string().max(2048).allow(null, ""),
            }),
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
        let dataToSendBack
        if (dataPassesValidation === true) {
            let {
                name,
                emailId,
                mobileNo,
                callTimings,
                productLink,
                productData,
            } = decryptedData

            await ProductQuoteRequest.create({
                emailId,
                mobileNo,
                name,
                callTimings,
                productLink,
                productData,
            })
                .then(res => {
                    dataToSendBack = res
                })

                .catch(err => {
                    console.log(err)
                    return h.response(err)
                })

            //
            // Encrypt data
            //
            dataToSendBack = {
                responseData:
                    DataEncrypterAndDecrypter.encryptData(dataToSendBack),
                message: "Request quote response added successfully",
            }
            //
            // Encrypt data
            //
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

let productQuoteRequestDetails = {
    method: "GET",
    path: "/api/admin/get-product-request-quotes",

    config: {
        cors: corsHeaders,
        tags: ["admin"],
        auth: {
            strategy: "restricted",
        },
    },

    handler: async (request, h) => {
        let dataToSendBack, objectData

        await ProductQuoteRequest.find({})
            .then(res => {
                objectData = res
            })
            .catch(err => console.log(err))

        dataToSendBack = {
            productAndCustomerDetails: objectData,
        }
        //
        // Encrypt data
        //
        dataToSendBack = {
            responseData: DataEncrypterAndDecrypter.encryptData(dataToSendBack),
            message: "Sending all product quote requests data",
        }
        //
        // Encrypt data
        //

        // console.log(dataToSendBack)

        return dataToSendBack
    },
}

let productVendorDetails = {
    method: "GET",
    path: "/api/admin/get-product-vendor-detail/{productId}",

    config: {
        cors: corsHeaders,
        tags: ["admin"],
        auth: {
            strategy: "restricted",
        },
    },

    handler: async (request, h) => {
        let dataToSendBack, objectData, vendorId

        await VendorDetail.find({
            "products.productId": `${request.params.productId}`,
        })
            .then(res => {
                vendorId = res[0].rLId
                // dataToSendBack = res
            })
            .catch(err => console.log(err))

        await NewUser.findOne({
            rLId: `${vendorId}`,
        })
            .then(res => {
                objectData = res
            })
            .catch(err => console.log(err))

        dataToSendBack = {
            vendorDetails: objectData,
        }

        //
        // Encrypt data
        //
        dataToSendBack = {
            responseData: DataEncrypterAndDecrypter.encryptData(dataToSendBack),
            message:
                "Sending all vendors ad requests and onBoard requests data",
        }
        //
        // Encrypt data
        //

        return dataToSendBack
    },
}

let ProductQuoteRequestRoute = [
    newProductQuoteRequest,
    productQuoteRequestDetails,
    productVendorDetails,
]

module.exports = ProductQuoteRequestRoute
