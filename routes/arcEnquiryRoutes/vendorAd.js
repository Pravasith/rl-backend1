'use strict'

// External dependencies
const Joi = require('joi')

// Internal dependencies
const NewVendorAd = require('../../models/newAdRequest')

const DataEncrypterAndDecrypter = require('../../factories/encryptDecrypt')


const corsHeaders = require('../../lib/routeHeaders')



let newVendorAd = {
    method: "POST",
    path: "/api/enquiry/new-vendor-ad-request",

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
            emailId: Joi.string().email({ minDomainAtoms: 2 }).required(),
            mobileNo: Joi.number().integer().max(9999999999).required()
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
        if(dataPassesValidation === true){

            let { name, mobileNo, emailId } = decryptedData

            await NewVendorAd.create(
                {
                    emailId,
                    mobileNo,
                    name
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
                responseData : DataEncrypterAndDecrypter.encryptData(dataToSendBack),
                message : "New ad created successfully"
            }
            // 
            // Encrypt data
            // 

        }

        else{

            dataToSendBack = {
                message : "Wrong data"
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



let VendorAdRoute = [
    newVendorAd
]

module.exports = VendorAdRoute