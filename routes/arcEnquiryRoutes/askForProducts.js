'use strict'

// External dependencies
const Joi = require('joi')

// Internal dependencies
const AskForProducts = require('../../models/newProductRequest')

const DataEncrypterAndDecrypter = require('../../factories/encryptDecrypt')

const corsHeaders = require('../../lib/routeHeaders')

//// START Routes

let newAskForProducts = {
    method: "POST",
    path: "/api/enquiry/ask-for-products",

    config: {
        cors: corsHeaders,
        tags: ['api'],
        auth: {
            strategy: 'restricted',
            mode: 'try'
        },
        validate: {
            payload: {
                requestData: Joi.string(),
                message: Joi.string(),
            }
        }
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
            productName: Joi.string().max(300).required(),
            mobileNo: Joi.number().integer().max(9999999999).required(),
            referenceImages: Joi.array().items(
                Joi.object().keys({
                    imageCode: Joi.string().max(500).required(),
                    imageURL: Joi.string().max(9000).required()
                })
            )
        })

        await Joi.validate(decryptedData, schema)
            .then((val) => {
                dataPassesValidation = true
            })
            .catch(e => {
                console.error(e)
                return h.response(e)
            })

        /////// VALIDATE PAYLOAD //////////////////////////////////////
        let dataToSendBack
        if (dataPassesValidation === true) {

            let { name, productName, mobileNo, referenceImages } = decryptedData

            await AskForProducts.create(
                {
                    name,
                    productName,
                    mobileNo,
                    referenceImages: referenceImages ? referenceImages : []
                }
            )
                .then(res => {
                    dataToSendBack = res
                })

                .catch((err) => {
                    console.log(err)
                    return h.response(err)
                })



            // 
            // Encrypt data
            // 
            dataToSendBack = {
                responseData: DataEncrypterAndDecrypter.encryptData(dataToSendBack),
                message: "Ask for product response recorded successfully"
            }
            // 
            // Encrypt data
            // 



        }

        else {

            dataToSendBack = {
                message: "Wrong data"
            }


            // 
            // Encrypt data
            // 
            dataToSendBack = {
                responseData: DataEncrypterAndDecrypter.encryptData(dataToSendBack),
                message: "TOXIC_DATA_ACTIVATED>LOCATION_TRACKED>196.0.0.1"
            }
            // 
            // Encrypt data
            // 
        }

        return h.response(dataToSendBack)
    }
}

/// END Routes

let AskForProductsRoute = [
    newAskForProducts
]

module.exports = AskForProductsRoute