"use strict"

// External dependencies
const Joi = require("joi")

const request = require("request")

const DataEncrypterAndDecrypter = require("../../factories/encryptDecrypt")

const corsHeaders = require("../../lib/routeHeaders")

const instance = require("../../config/paymentConfig")

let verifyPayment = {
    method: "POST",
    path: "/api/payments/verification",

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

    handler: async (req, h) => {
        let { requestData, message } = req.payload

        //
        // DECRYPT REQUEST DATA
        //
        let decryptedData = DataEncrypterAndDecrypter.decryptData(requestData)
        //
        // DECRYPT REQUEST DATA
        //

        let { tId, amount } = decryptedData
        let dataToSendBack

        /////// VALIDATE PAYLOAD //////////////////////////////////////
        let dataPassesValidation = false

        const schema = Joi.object().keys({
            tId: Joi.string().required(),
            amount: Joi.number().required(),
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

        const dummy = () => {
            return new Promise((resolve, reject) => {
                request(
                    {
                        method: "POST",
                        url: `https://${instance.key_id}:${instance.key_secret}@api.razorpay.com/v1/payments/${tId}/capture`,
                        form: { amount },
                    },
                    (error, response, body) => {
                        resolve({
                            headers: response.headers,
                            status: JSON.parse(response.statusCode),
                            response: JSON.parse(body),
                        })
                    }
                )
            })
        }

        if (dataPassesValidation === true) {
            await dummy()
                .then(res => {
                    //
                    // Encrypt data
                    //
                    dataToSendBack = {
                        responseData:
                            DataEncrypterAndDecrypter.encryptData(res),
                        message: "Suspect captured successfully and convicted",
                    }
                    //
                    // Encrypt data
                    //
                })
                .catch(er => console.log(err))

            return h.response(dataToSendBack).code(200)
        }
    },
}

let PaymentRouter = [verifyPayment]

module.exports = PaymentRouter
