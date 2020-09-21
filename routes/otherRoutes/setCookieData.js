'use strict'

// External dependencies
const Joi = require('joi')

const corsHeaders = require('../../lib/routeHeaders')

const DataEncrypterAndDecrypter = require('../../factories/encryptDecrypt')

let setDataCookie = {
    method: "POST",
    path: "/api/checkout/cookie-store",

    config: {
        cors: corsHeaders,
        validate: {
            payload: {
                requestData: Joi.string(),
                message: Joi.string()
            }
        },
        auth: {
            strategy: 'restricted',
            mode: 'try'
        },
        tags: ['api'],
    },
    handler: async (request, h) => {

        let { requestData, message } = request.payload
        let dataToSendBack

        //
        // DECRYPT REQUEST DATA
        // 
        let decryptedData = DataEncrypterAndDecrypter.decryptData(
            requestData
        )
        //
        // DECRYPT REQUEST DATA
        //

        // console.log(decryptedData)

        /////// VALIDATE PAYLOAD //////////////////////////////////////
        let dataPassesValidation = false

        const schema = Joi.object().keys({
            cartData: Joi.array().items(
                Joi.object().keys(
                    {
                        // productName: Joi.string().max(200).required(), // verified frontend
                        // productCode: Joi.string().max(30).required(), // verified frontend
                        // basePrice: Joi.number().integer().max(99999999).required().allow(null), // verified frontend
                        // gstPercentage: Joi.number().max(100).required(), // verified frontend
    
                        // Custom options
                        productMaterial: Joi.object().keys({
                            materialCost: Joi.number().integer().max(99999999).required(), // verified frontend
                            materialName: Joi.string().max(60).required(), // verified frontend
                            materialGrade: Joi.string().max(30).allow(null, ""), // verified frontend
                        }).required(), // verified frontend
    
                        finishingOption: Joi.object().keys({
                            finishName: Joi.string().max(30).required(), // verified frontend
                            finishCode: Joi.string().max(30).allow(null, ""), // verified frontend
                            finishImage: Joi.string().required(), // verified frontend
                            finishCost: Joi.number().max(99999999)  // verified frontend
                        }), // verified frontend
    
                        colorOption: Joi.object().keys({
                            colorName: Joi.string().max(30).required(), // verified frontend
                            colorCode: Joi.string().max(7).required(), // verified frontend
                            colorCost: Joi.number().max(99999999) // verified frontend
                        }), // verified frontend
    
                        size: Joi.object().keys({
                            sizeName: Joi.string().max(100), // verified frontend
                            sizeCost: Joi.number().max(99999999) // verified frontend
                        }), // verified frontend
    
                        quantity: Joi.number().max(99999999).required(), // verified frontend

                        productId: Joi.string().max(80).required(),

                        // discount: Joi.number().max(100).required(), // verified frontend
                        // productImages: Joi.array().items(
                        //     Joi.object().keys({
                        //         itemCode: Joi.string().max(100).allow(null, "").required(), // verified frontend
                        //         textOnRibbonSatisfied: Joi.boolean().required(), // verified frontend
                        //         imageURL: Joi.string().max(2048).required() // verified frontend
                        //     })
                        // ).required(), // verified frontend
                        // productThumbImage: Joi.string().max(2048).required(), // verified frontend
                        // brandName: Joi.string().max(30).allow(null, ""),
                        // brandImage: Joi.string().max(2048).allow(null, ""),
                        // netPriceInclGST: Joi.string(),
                        // totalPriceInclGST: Joi.string()
                    }
                )
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

        if(dataPassesValidation === true){
            let { cartData } = decryptedData
            
            let newCookie = {
                ...request.auth.credentials,
                cartData
            }

            request.cookieAuth.set(
                {
                    ...newCookie
                }
            )

            dataToSendBack = {
                message: "Cookie Set"
            };
    
            //
            // Encrypt data
            //
            dataToSendBack = {
                responseData: DataEncrypterAndDecrypter.encryptData(dataToSendBack),
                message: "Cookie set"
            };
            //
            // Encrypt data
            //


        }
        else {
            dataToSendBack = {
              message: "Wrong data"
            };
      
            //
            // Encrypt data
            //
            dataToSendBack = {
              responseData: DataEncrypterAndDecrypter.encryptData(dataToSendBack),
              message: "TOXIC_DATA_ACTIVATED>LOCATION_TRACKED>196.0.0.1"
            };
            //
            // Encrypt data
            //
        }

        return h.response(dataToSendBack).code(201)
    }
}

let getDataCookie = {
    method: "GET",
    path: "/api/checkout/get-cookie-store",

    config: {
        cors: corsHeaders,
        auth: {
            strategy: 'restricted',
            mode: 'try'
        },
        tags: ['api'],
    },
    handler: async (request, h) => {

        let dataToSendBack

        dataToSendBack = {
            authData : request.auth.credentials
        }

        //
        // Encrypt data
        //
        dataToSendBack = {
            responseData: DataEncrypterAndDecrypter.encryptData(dataToSendBack),
            message: "incoming auth"
        }
        //
        // Encrypt data
        //

        return h.response(dataToSendBack).code(201)
    }
}

let destroyDataCookie = {
    method: "DELETE",
    path: "/api/checkout/destroy-cookie-store",

    config: {
        cors: corsHeaders,
        validate: {
            payload: {
                requestData: Joi.string(),
                message: Joi.string(),
            }
        },
        auth: {
            strategy: 'restricted',
            // mode: 'try'
        },
        tags: ['api'],
    },
    handler: async (request, h) => {

        request.cookieAuth.clear()

        return h.response("Data destroyed")
    }
}


let setCookieRoute = [
    setDataCookie,
    getDataCookie,
    destroyDataCookie
]

module.exports = setCookieRoute