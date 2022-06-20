"use strict"

// External dependencies
const Joi = require("joi")

// Internal dependencies
const CustomDesignRequest = require("../../models/submitDesignRequest")

const DataEncrypterAndDecrypter = require("../../factories/encryptDecrypt")

const corsHeaders = require("../../lib/routeHeaders")

let newCustomDesignRequest = {
    method: "POST",
    path: "/api/enquiry/custom-design-enquiry",

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
            referenceImages: Joi.array()
                .items(
                    Joi.object().keys({
                        imageCode: Joi.string().max(500).required(),
                        imageURL: Joi.string().max(9000).required(),
                    })
                )
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
        let dataToSendBack
        if (dataPassesValidation === true) {
            let { name, emailId, mobileNo, referenceImages } = decryptedData

            await CustomDesignRequest.create({
                name,
                emailId,
                mobileNo,
                referenceImages: referenceImages ? referenceImages : [],
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
                message: "Submit custom design response recorded successfully",
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

let customDesignDetails = {
    method: "GET",
    path: "/api/admin/get-custom-design-requests",

    config: {
        cors: corsHeaders,
        tags: ["admin"],
        auth: {
            strategy: "restricted",
        },
    },

    handler: async (request, h) => {
        let dataToSendBack, responseData

        await CustomDesignRequest.find({})
            .then(res => {
                responseData = res
            })
            .catch(err => console.log(err))

        dataToSendBack = {
            customDesignRequests: responseData,
        }

        //
        // Encrypt data
        //
        dataToSendBack = {
            responseData: DataEncrypterAndDecrypter.encryptData(dataToSendBack),
            message: "Sending all custom design requests data",
        }
        //
        // Encrypt data
        //

        return dataToSendBack
    },
}

let CustomDesignRoute = [customDesignDetails, newCustomDesignRequest]

module.exports = CustomDesignRoute
