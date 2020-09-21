'use strict'

// External dependencies
const Joi = require('joi')
const Bcrypt = require('bcryptjs')
const config = require('../../config')

// Internal dependencies
const NewAdmin = require('../../models/newAdmins')

const corsHeaders = require('../../lib/routeHeaders')
const isDev = process.env.NODE_ENV.trim() !== "production"


const DataEncrypterAndDecrypter = require('../../factories/encryptDecrypt')

const createAdminId = () => {
    function generateRandomString() {
        var text = ""
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

        for (var i = 0; i < 5; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length))

        return text
    }

    const prefixCode = generateRandomString()
    const suffixCode = generateRandomString()

    const date = new Date()

    let dateAndTime = {
        "DD": date.getDate(),
        "MM": date.getMonth() + 1,
        "YY": date.getFullYear(),

        "HRS": date.getHours(),
        "MINS": date.getMinutes(),
        "SECS": date.getSeconds(),
        "MILSECS": date.getMilliseconds(),

        "TIME": date.getTime()
    }

    let adminId = "ADM-" + prefixCode + dateAndTime.TIME + suffixCode

    return adminId

}


// // Creates a universal Admin user //
// let createAdmin = {

//     method: "GET",
//     path: "/api/admin/create-admin-new",

//     options: {
//         cors: corsHeaders,
//         // validate: {
//         //     payload: {
//         //         requestData: Joi.string(),
//         //         message: Joi.string(),
//         //     }
//         // },
//         tags: ['admin'], 
//         // auth: {
//         //     strategy: 'restricted',
//         //     mode: 'try'
//         // },
//     },

//     handler: async  (request, h) => {

//         let password = "XXN_@922908@_TXX"

//         await Bcrypt.hash(password, 10)
//         .then( hash => {
//             // Store hash in your password DB.
//             password = hash
//         })

//         let dataToSendBack = {
//             adminName : "Tippu",
//             adminPassword : password,
//             adminEmail : "tippu@rollinglogs.com",
//             adminAlternateEmail : "tippu.sulthan001@gmail.com",
//             adminMobile : 9052110040,
//             adminId : createAdminId()
//         }

//         await NewAdmin.create(
//             dataToSendBack,
//         )

//         .then(res => console.log(res))
//         .catch(e => {
//             console.error(e)
//             return h.response(e)
//         })


//         return h.response(dataToSendBack).code(201)
//     }
// }


/// LOGIN
let adminLogin = {
    method: "POST",
    path: "/api/admin/admin-login",

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
            mode: 'try'
        },
        tags: ['api'],
    },
    handler: async (request, h) => {

        let { requestData, message } = request.payload

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
            adminPassword: Joi.string().min(6).max(1000).required(),
            adminEmail: Joi.string().email({ minDomainAtoms: 2 }).required(),          
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

            let { adminPassword, adminEmail } = decryptedData
            let dataToSendBack, temp, id, userNotRegistered = false
    
            
            if(adminPassword !== "1234"){
                // check if email exists
                await NewAdmin.findOne({
                    adminEmail
                })
                    .then(result => {
                        if (result) {
                            temp = result
                            id = result._id
                        }

                        else {
                            userNotRegistered = true
                            dataToSendBack = { 
                                registered: false, 
                                passwordRight: true 
                            }

                            // 
                            // Encrypt data
                            // 
                            dataToSendBack = {
                                responseData: DataEncrypterAndDecrypter.encryptData(dataToSendBack),
                                message: "User not registered"
                            }
                            // 
                            // Encrypt data
                            // 
                        }
                    })
                    .catch(e => {
                        h.response(e)
                    })

                const comparePassword = async () => {
                    const adminId = temp._doc.adminId

                    await Bcrypt.compare(adminPassword, temp._doc.adminPassword)
                        .then((res) => {
                            if (res === true) {
                                dataToSendBack = { ...temp._doc, registered: true, passwordRight: true }

                                // 
                                // Encrypt data
                                // 
                                dataToSendBack = {
                                    responseData: DataEncrypterAndDecrypter.encryptData(dataToSendBack),
                                    message: "User logged in successfully"
                                }
                                // 
                                // Encrypt data
                                // 

                                request.cookieAuth.set({ adminEmail, adminId })
                            }

                            if (res === false){
                                dataToSendBack = { registered: true, passwordRight: false }

                                //
                                // Encrypt data
                                //
                                dataToSendBack = {
                                    responseData: DataEncrypterAndDecrypter.encryptData(dataToSendBack),
                                    message: "Wrong password!"
                                }
                                //
                                // Encrypt data
                                //
                            }
                            
                        })
                        .catch(e => h.response(e))

                }

                if (temp) {
                    await comparePassword()
                }

                return h.response(dataToSendBack)
            }
    
            
        }

    }
}

let getAdminDetails = {
    method: "GET",
    path: "/api/admin/get-admin-data",

    config: {
        cors: corsHeaders,
        auth: {
            strategy: 'restricted',
        },
        tags: ['api'],
    },
    handler: async (request, h) => {

        // const { emailId } =  request.payload
        let dataToSendBack

        // if(request.auth.credentials.emailId){
            // check if email exists
            await NewAdmin.findOne({
                adminId: request.auth.credentials.adminId
            })
            .then(result => {
                if (result) {
                    dataToSendBack = { ...result._doc, userFound: true }
                    // 
                    // Encrypt data
                    // 
                    dataToSendBack = {
                        responseData: DataEncrypterAndDecrypter.encryptData(dataToSendBack),
                        message: "Admin credentials found"
                    }
                    // 
                    // Encrypt data
                    // 
                }

                else {
                    dataToSendBack = { userFound: false }

                    // 
                    // Encrypt data
                    // 
                    dataToSendBack = {
                        responseData: DataEncrypterAndDecrypter.encryptData(dataToSendBack),
                        message: "Admin credentials not found"
                    }
                    // 
                    // Encrypt data
                    // 
                }
            })
            .catch(e => h.response(e))

        // }

        // else{
        //     dataToSendBack = {
        //         notAuthenticated : true
        //     }
        // }

        
        // inside route
        // request.server.publish('/some-channel/' + dataToSendBack.emailId, { message: 'hello' })

        return h.response(dataToSendBack)
    }
}

let AdminDataRoute = [
    // createAdmin,
    adminLogin,
    getAdminDetails
]

module.exports = AdminDataRoute