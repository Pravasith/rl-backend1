"use strict"

// External dependencies
const Joi = require("joi")

// Internal dependencies
const NewSubscriber = require("../../models/newSubscriber")

const corsHeaders = require("../../lib/routeHeaders")
const isDev = process.env.NODE_ENV.trim() !== "production"

const DataEncrypterAndDecrypter = require("../../factories/encryptDecrypt")

let createSubscriber = {
    method: "POST",
    path: "/api/news-letter/create-subscriber",

    options: {
        cors: corsHeaders,
        // validate: {
        //     payload: {
        //         requestData: Joi.string(),
        //         // message: Joi.string(),
        //     }
        // },
        tags: ["api"],
        auth: {
            strategy: "restricted",
            mode: "try",
        },
    },

    handler: async (request, h) => {
        let { requestData } = request.payload

        console.log(request.auth)

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
            name: Joi.string().min(3).max(30).required(),
            emailId: Joi.string().email({ minDomainAtoms: 2 }).required(),
            mobile: Joi.number().required(),
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

        if (dataPassesValidation === true) {
            let { name, emailId, mobile } = decryptedData
            let dataToSendBack, emailIsTaken

            emailId = emailId.toLowerCase()

            await NewSubscriber.findOne({
                emailId: emailId,
            })
                .then(result => {
                    if (result) {
                        emailIsTaken = true
                    } else {
                        emailIsTaken = false
                    }
                })
                .catch(e => h.response(e))

            if (emailIsTaken) {
                dataToSendBack = { itsTaken: true }

                //
                // Encrypt data
                //
                dataToSendBack = {
                    responseData:
                        DataEncrypterAndDecrypter.encryptData(dataToSendBack),
                    message: "Email already subscribed",
                }
                //
                // Encrypt data
                //
            } else {
                await NewSubscriber.create({
                    name,
                    emailId,
                    mobile,
                })
                    .then(newSubscriber => {
                        dataToSendBack = {
                            ...newSubscriber._doc,
                            itsTaken: false,
                        }

                        //
                        // Encrypt data
                        //
                        dataToSendBack = {
                            responseData:
                                DataEncrypterAndDecrypter.encryptData(
                                    dataToSendBack
                                ),
                            message: "User subscribed successfully",
                        }
                        //
                        // Encrypt data
                        //

                        let id = newSubscriber._id

                        request.cookieAuth.set({
                            subscriberData: {
                                emailId,
                                mobile,
                                name,
                            },
                        })
                    })
                    .catch(err => {
                        console.log(err)
                        return h.response(err)
                    })
            }

            return h.response(dataToSendBack).code(201)
        }
    },
}

let NewsLetterRoute = [createSubscriber]

module.exports = NewsLetterRoute
