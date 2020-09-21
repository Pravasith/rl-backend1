'use strict'

// External dependencies
const Joi = require('joi');

const request = require('request');

const DataEncrypterAndDecrypter = require('../../factories/encryptDecrypt');

const corsHeaders = require('../../lib/routeHeaders');

// const instance = require('../../config/paymentConfig');

let verifyPayment = {
    method: "POST",
    path: "/api/saved-address/create-address",

    config: {
        cors: corsHeaders,
        auth: {
            strategy: 'restricted',
        },
        tags: ['api'],
        validate: {
            payload: {
                requestData: Joi.string(),
                message: Joi.string(),
            }
        }
    },

    handler: async (req, h) => {
        let { requestData, message } = req.payload;
        
        //
        // DECRYPT REQUEST DATA
        // 
        let decryptedData = DataEncrypterAndDecrypter.decryptData(
            requestData
        )
        //
        // DECRYPT REQUEST DATA
        //

        /////// VALIDATE PAYLOAD //////////////////////////////////////
        let dataPassesValidation = false

        const schema = Joi.object().keys({
            doorNumber: Joi.string().required(),
            landmark: Joi.string().required(),
            completeAddress: Joi.string().required(),
            mobileNumber: Joi.number().max(10).required()
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

        if(dataPassesValidation === true) {
        }

        return "abcd"
    }
}

let SavedAddressRouter = [verifyPayment]

module.exports = SavedAddressRouter;