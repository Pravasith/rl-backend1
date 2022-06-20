"use strict"

// External dependencies
const Joi = require("joi")

// Internal dependencies
const NewVendorAd = require("../../models/newAdRequest")
const NewVendorOnboard = require("../../models/newVendorOnboard")

const DataEncrypterAndDecrypter = require("../../factories/encryptDecrypt")

const corsHeaders = require("../../lib/routeHeaders")

let newVendorOnboard = {
    method: "POST",
    path: "/api/enquiry/new-vendor-onboard",

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
            let { name, mobileNo, emailId } = decryptedData

            await NewVendorOnboard.create({
                emailId,
                mobileNo,
                name,
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
                message: "New vendor on board response recorded successfully",
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

let getPartnerShipRequests = {
    method: "GET",
    path: "/api/admin/get-vendor-partnership-requests",

    config: {
        cors: corsHeaders,
        tags: ["admin"],
        auth: {
            strategy: "restricted",
        },
    },

    handler: async (request, h) => {
        let dataToSendBack

        await Promise.all([NewVendorOnboard.find({}), NewVendorAd.find({})])
            .then(res => {
                dataToSendBack = res.reduce((all, item, i) => {
                    all.push(...item)
                    return all
                }, [])

                dataToSendBack = {
                    vendorOnboardAndAdRequests: dataToSendBack,
                }
            })
            .catch(err => console.log(err))

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

let VendorOnboardRoute = [newVendorOnboard, getPartnerShipRequests]

module.exports = VendorOnboardRoute
