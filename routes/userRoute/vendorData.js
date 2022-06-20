"use strict"

// External dependencies
const Joi = require("joi")

// Internal dependencies
const NewVendor = require("../../models/newVendors")
const NewUser = require("../../models/newUsers")

const DataEncrypterAndDecrypter = require("../../factories/encryptDecrypt")

const corsHeaders = require("../../lib/routeHeaders")

let createOrUpdateVendorData = {
    method: "PUT",
    path: "/api/user/update-vendor-data",

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
            companyName: Joi.string().max(50),

            address: Joi.object().keys({
                detailedAddressLine1: Joi.string().max(100),
                detailedAddressLine2: Joi.string().max(100).allow(null),
                state: Joi.string().max(30),
                city: Joi.string().max(30),
                pincode: Joi.number().integer().max(999999),
            }),

            "address.detailedAddressLine1": Joi.string().max(100),
            "address.detailedAddressLine2": Joi.string().max(100).allow(null),
            "address.state": Joi.string().max(30),
            "address.city": Joi.string().max(30),
            "address.pincode": Joi.number().integer().max(999999),

            companyDescriptionLine1: Joi.string().max(300),
            companyDescriptionLine2: Joi.string().max(300).allow(null),

            experience: Joi.object().keys({
                years: Joi.string().max(20),
                months: Joi.string().max(20).allow(null),
            }),

            "experience.years": Joi.string().max(20),
            "experience.months": Joi.string().max(20).allow(null),

            GSTIN: Joi.string().max(19),
            PAN: Joi.string().alphanum().max(10),
            companyProfilePicture: Joi.string(),
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
        let dataToSendBack, rLIdIsTaken

        if (dataPassesValidation === true) {
            const rLId = request.auth.credentials.rLId

            decryptedData = {
                ...decryptedData,
                rLId,
            }

            // check if email exists
            await NewVendor.findOne({
                rLId,
            })
                .then(result => {
                    if (result) {
                        rLIdIsTaken = true
                        // console.log("rLIdIsTaken", rLIdIsTaken)
                    } else {
                        rLIdIsTaken = false
                        // console.log("rLIdIsTaken", rLIdIsTaken)
                    }
                })
                .catch(e => h.response(e))

            if (rLIdIsTaken) {
                // check if email exists
                await NewVendor.findOneAndUpdate(
                    {
                        rLId,
                    },
                    {
                        $set: {
                            ...decryptedData,
                            lifeCycleStage: 2,
                        },
                    },
                    {
                        new: true,
                    }
                )
                    .then(result => {
                        dataToSendBack = result

                        //
                        // Encrypt data
                        //
                        dataToSendBack = {
                            responseData:
                                DataEncrypterAndDecrypter.encryptData(
                                    dataToSendBack
                                ),
                            message: "Vendor Details changed successfully",
                        }
                        //
                        // Encrypt data
                        //
                    })
                    .catch(err => {
                        return h.response(err)
                    })
            } else {
                await NewVendor.create({
                    ...decryptedData,
                    lifeCycleStage: 2,
                })

                    .then(newUser => {
                        dataToSendBack = { ...newUser._doc }

                        //
                        // Encrypt data
                        //
                        dataToSendBack = {
                            responseData:
                                DataEncrypterAndDecrypter.encryptData(
                                    dataToSendBack
                                ),
                            message: "Vendor Details created successfully",
                        }
                        //
                        // Encrypt data
                        //
                    })
                    .catch(err => {
                        console.log(err)
                        return h.response(err)
                    })
            }
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

let getVendorDetailsPublic = {
    method: "POST",
    path: "/api/user/get-public-vendor-data",

    config: {
        cors: corsHeaders,
        auth: {
            strategy: "restricted",
            mode: "try",
        },
        tags: ["api"],
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
            rLId: Joi.string().max(50).required(),
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
        const { rLId } = decryptedData

        let dataToSendBack

        if (dataPassesValidation === true) {
            await Promise.all([
                NewVendor.findOne({ rLId }),
                NewUser.findOne({ rLId }),
            ])

                // check if email exists
                .then(result => {
                    if (result) {
                        let tempArray = [...result]

                        dataToSendBack = tempArray.reduce((all, item, j) => {
                            all = {
                                ...all,
                                ...item._doc,
                            }
                            return all
                        }, {})

                        dataToSendBack = {
                            companyProfilePicture:
                                dataToSendBack.companyProfilePicture,
                            companyName: dataToSendBack.companyName,
                            experience: dataToSendBack.experience,
                            companyDescriptionLine1:
                                dataToSendBack.companyDescriptionLine1,
                            companyDescriptionLine2:
                                dataToSendBack.companyDescriptionLine2,
                            address: dataToSendBack.address,
                            products: dataToSendBack.products,
                            profilePicture: dataToSendBack.profilePicture,
                        }

                        //
                        // Encrypt data
                        //
                        dataToSendBack = {
                            responseData:
                                DataEncrypterAndDecrypter.encryptData(
                                    dataToSendBack
                                ),
                            message: "User credentials found",
                        }
                        //
                        // Encrypt data
                        //
                    } else {
                        dataToSendBack = {
                            userFound: false,
                        }

                        //
                        // Encrypt data
                        //
                        dataToSendBack = {
                            responseData:
                                DataEncrypterAndDecrypter.encryptData(
                                    dataToSendBack
                                ),
                            message: "User credentials not found",
                        }
                        //
                        // Encrypt data
                        //
                    }
                })
                .catch(e => h.response(e))
        }

        // inside route request.server.publish('/some-channel/' +
        // dataToSendBack.emailId, { message: 'hello' })
        else {
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

let getVendorDetails = {
    method: "GET",
    path: "/api/user/get-vendor-data",

    config: {
        cors: corsHeaders,
        auth: {
            strategy: "restricted",
        },
        tags: ["api"],
    },
    handler: async (request, h) => {
        // const { emailId } =  request.payload
        let dataToSendBack

        // check if email exists
        await NewVendor.findOne({ rLId: request.auth.credentials.rLId })
            .then(result => {
                if (result) {
                    dataToSendBack = {
                        ...result._doc,
                        userFound: true,
                    }

                    //
                    // Encrypt data
                    //
                    dataToSendBack = {
                        responseData:
                            DataEncrypterAndDecrypter.encryptData(
                                dataToSendBack
                            ),
                        message: "User credentials found",
                    }
                    //
                    // Encrypt data
                    //
                } else {
                    dataToSendBack = {
                        userFound: false,
                    }

                    //
                    // Encrypt data
                    //
                    dataToSendBack = {
                        responseData:
                            DataEncrypterAndDecrypter.encryptData(
                                dataToSendBack
                            ),
                        message: "User credentials not found",
                    }
                    //
                    // Encrypt data
                    //
                }
            })
            .catch(e => h.response(e))

        // inside route request.server.publish('/some-channel/' +
        // dataToSendBack.emailId, { message: 'hello' })

        return h.response(dataToSendBack)
    },
}

let VendorDataRoute = [
    createOrUpdateVendorData,
    getVendorDetails,
    getVendorDetailsPublic,
]

module.exports = VendorDataRoute
