'use strict'

// External dependencies
const Joi = require('joi')
const Bcrypt = require('bcryptjs')
const config = require('../../config')

// Internal dependencies
const NewUser = require('../../models/newUsers')
const NewVendor = require('../../models/newVendors')

const DataEncrypterAndDecrypter = require('../../factories/encryptDecrypt')


const corsHeaders = require('../../lib/routeHeaders')
const isDev = process.env.NODE_ENV.trim() !== "production"


const createUserRLId = (userType) => {

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

    let rLId = prefixCode + dateAndTime.TIME + suffixCode

    if (userType === "architect") {
        rLId = "ARC-" + rLId
    }

    else if (userType === "vendor") {
        rLId = "VEN-" + rLId
    }

    else if (userType === "student") {
        rLId = "ARCSTU-" + rLId
    }

    else if (userType === "commonUser") {
        rLId = "CLI-" + rLId
    }

    return rLId

}


// Creates a universal RL user //
let createUser = {

    method: "POST",
    path: "/api/user/create-user",

    options: {
        cors: corsHeaders,
        validate: {
            payload: {
                requestData: Joi.string(),
                message: Joi.string(),
            }
        },
        tags: ['api'], 
        auth: {
            strategy: 'restricted',
            mode: 'try'
        },
    },

    handler: async  (request, h) => {

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
            password: Joi.string().min(6).max(30).required(),
            emailId: Joi.string().email({ minDomainAtoms: 2 }).required(),
            rLId: Joi.string().max(100).required(),
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
            let { password, emailId, rLId } = decryptedData
            let dataToSendBack, emailIsTaken
        
            emailId = emailId.toLowerCase()
    
            const determineUserType = (rLId) => {
                const prefix = rLId.split("-", 1)[0]
                let userType
    
                if(prefix === "VEN"){
                    userType = "vendor"
                }
    
                else if (prefix === "ARC") {
                    userType = "architect"
                }
    
                else if (prefix === "STU") {
                    userType = "student"
                }
    
                else if (prefix === "CLI") {
                    userType = "commonUser"
                }
    
                return userType
            }
    
    
            await Bcrypt.hash(password, 10)
            .then( hash => {
                // Store hash in your password DB.
                password = hash
            })

            // console.log(password)

            // check if email exists
            await NewUser.findOne({
                emailId: emailId
            })
            .then( result => {
    
                if(result){
                    emailIsTaken = true
                }
                
                else{
                    emailIsTaken = false
                }
            })
            .catch( e => h.response(e))
    
            if(emailIsTaken){
                dataToSendBack = {itsTaken : true}
            }
    
            else{
                await NewUser.create(
                    {
                        emailId,
                        password,
                        rLId,
                        userType : determineUserType(rLId)
                    }
                )
    
                .then((newUser) => {
                    dataToSendBack = { ...newUser._doc, itsTaken : false }
    
                    // 
                    // Encrypt data
                    // 
                    dataToSendBack = { 
                        responseData : DataEncrypterAndDecrypter.encryptData(dataToSendBack),
                        message : "User created successfully"
                    }
                    // 
                    // Encrypt data
                    // 
    
                    let id = newUser._id
    
                    request.cookieAuth.set(
                        {
                            emailId,
                            id,
                            rLId 
                        }
                    )
    
                    NewVendor.create(
                        {
                            rLId
                        }
                    )
                    .then((vendorData) => {
                        // dataToSendBack = { ...vendorData._doc }
    
                        // // 
                        // // Encrypt data
                        // // 
                        // dataToSendBack = {
                        //     responseData: DataEncrypterAndDecrypter.encryptData(dataToSendBack),
                        //     message: "Vendor Details created successfully"
                        // }
                        // // 
                        // // Encrypt data
                        // // 
    
                    })
                    .catch((err) => {
                        console.log(err)
                        return h.response(err)
                    })
                
                })
                .catch((err) => {
                    console.log(err)
                    return h.response(err)
                })
            }
    
            return h.response(dataToSendBack).code(201)
        }
        
    }
}
// Creates a universal RL user //



// VENDOR // // VENDOR // // VENDOR // // VENDOR // // VENDOR // // VENDOR // 
// VENDOR // // VENDOR // // VENDOR // // VENDOR // // VENDOR // // VENDOR // 
// VENDOR // // VENDOR // // VENDOR // // VENDOR // // VENDOR // // VENDOR // 
let googleKnockVendor = {
    method: '*',
    path: '/knock/google-vendor',
    options: {
        cors: corsHeaders,
        auth: {
            strategy: 'google',
        },
        tags: ['api'],
    },
    handler: async function (request, h) {

        if (!request.auth.isAuthenticated) {
            return h.response(
                Boom.unauthorized('Authentication failed: ' + request.auth.error.message)
            )
        }

        // console.log(request.auth.credentials)

        let googleCreds = {
            firstName: request.auth.credentials.profile.raw.given_name,
            lastName: request.auth.credentials.profile.raw.family_name,
            googleId: request.auth.credentials.profile.raw.sub,
            profilePicture: request.auth.credentials.profile.raw.picture,
            googleProfileURL: request.auth.credentials.profile.raw.profile,
            emailId: request.auth.credentials.profile.raw.email,
        }

        request.cookieAuth.set(googleCreds)

        // return '<pre>' + JSON.stringify(request.auth.credentials, null, 4) + '</pre>';
        return h.redirect('/api/user/login-google-user?type=vendor')
    }
}

let linkedInKnockVendor = {
    method: '*',
    path: '/knock/linkedin-vendor',
    options: {
        cors: corsHeaders,
        auth: {
            strategy: 'linkedin',
        },
        handler: async function (request, h) {

            if (!request.auth.isAuthenticated) {
                return h.response(Boom.unauthorized('Authentication failed: ' + request.auth.error.message))
            }

            // console.log(request.auth.credentials)

            let linkedinCreds = {
                firstName: request.auth.credentials.profile.raw.firstName,
                lastName: request.auth.credentials.profile.raw.lastName,
                linkedinId: request.auth.credentials.profile.raw.id,
                profilePicture: request.auth.credentials.profile.raw.pictureUrl,
                linkedinProfileURL: request.auth.credentials.profile.raw.siteStandardProfileRequest.url,
                professionalTitle: request.auth.credentials.profile.raw.headline,
                emailId: request.auth.credentials.profile.raw.emailAddress,
                // rLId: createUserRLId('vendor')
            }

            request.cookieAuth.set(linkedinCreds)


            // return '<pre>' + JSON.stringify(request.auth.credentials, null, 4) + '</pre>';
            return h.redirect('/api/user/login-linkedin-user?type=vendor')
        }
    }
}
// VENDOR // // VENDOR // // VENDOR // // VENDOR // // VENDOR // // VENDOR // 
// VENDOR // // VENDOR // // VENDOR // // VENDOR // // VENDOR // // VENDOR // 
// VENDOR // // VENDOR // // VENDOR // // VENDOR // // VENDOR // // VENDOR // 





// COMMONUSER // // COMMONUSER // // COMMONUSER // // COMMONUSER // // COMMONUSER // 
// COMMONUSER // // COMMONUSER // // COMMONUSER // // COMMONUSER // // COMMONUSER // 
// COMMONUSER // // COMMONUSER // // COMMONUSER // // COMMONUSER // // COMMONUSER // 
let googleKnockCommonUser = {
    method: '*',
    path: '/knock/google-common-user',
    options: {
        cors: corsHeaders,
        auth: {
            strategy: 'google',
        },
        tags: ['api'],
        handler: async function (request, h) {

            if (!request.auth.isAuthenticated) {
                return h.response(
                    Boom.unauthorized('Authentication failed: ' + request.auth.error.message)
                )
            }

            // console.log(request.auth.credentials)

            let googleCreds = {
                firstName: request.auth.credentials.profile.raw.given_name,
                lastName: request.auth.credentials.profile.raw.family_name,
                googleId: request.auth.credentials.profile.raw.sub,
                profilePicture: request.auth.credentials.profile.raw.picture,
                googleProfileURL: request.auth.credentials.profile.raw.profile,
                emailId: request.auth.credentials.profile.raw.email,
            }

            request.cookieAuth.set(googleCreds)




            // return '<pre>' + JSON.stringify(request.auth.credentials, null, 4) + '</pre>';
            return h.redirect('/api/user/login-google-user?type=commonUser')
        }
    }
}

let linkedInKnockCommonUser = {
    method: '*',
    path: '/knock/linkedin-common-user',
    options: {
        cors: corsHeaders,
        auth: {
            strategy: 'linkedin',
        },
        handler: async function (request, h) {

            if (!request.auth.isAuthenticated) {
                return h.response(Boom.unauthorized('Authentication failed: ' + request.auth.error.message))
            }

            // console.log(request.auth.credentials)

            let linkedinCreds = {
                firstName: request.auth.credentials.profile.raw.firstName,
                lastName: request.auth.credentials.profile.raw.lastName,
                linkedinId: request.auth.credentials.profile.raw.id,
                profilePicture: request.auth.credentials.profile.raw.pictureUrl,
                linkedinProfileURL: request.auth.credentials.profile.raw.siteStandardProfileRequest.url,
                professionalTitle: request.auth.credentials.profile.raw.headline,
                emailId: request.auth.credentials.profile.raw.emailAddress,
                // rLId: createUserRLId('vendor')
            }

            request.cookieAuth.set(linkedinCreds)

            

            // return '<pre>' + JSON.stringify(request.auth.credentials, null, 4) + '</pre>';
            return h.redirect('/api/user/login-linkedin-user?type=commonUser')
        }
    }
}
// COMMONUSER // // COMMONUSER // // COMMONUSER // // COMMONUSER // // COMMONUSER // 
// COMMONUSER // // COMMONUSER // // COMMONUSER // // COMMONUSER // // COMMONUSER // 
// COMMONUSER // // COMMONUSER // // COMMONUSER // // COMMONUSER // // COMMONUSER // 





let googleViewVendor = {
    method: 'GET',
    path: '/api/user/login-google-user',
    config: {
        cors: corsHeaders,
        auth: {
            strategy: 'restricted',
        },
        tags: ['api'],
        handler: async (request, h) => {

            // check if username exists and create if he/she doesn't
            let userIsTaken,
                dataToSendBack

            const { type } = request.query

            await NewUser.findOne({
                emailId: request.auth.credentials.emailId
            })
            .then(result => {
                if (result) {
                    userIsTaken = true
                    dataToSendBack = result
                }

                else {
                    userIsTaken = false
                }


            })
            .catch(e => h.response(e))

            if (userIsTaken) {

                await NewUser.findOneAndUpdate(
                    {
                        emailId: request.auth.credentials.emailId
                    },
                    {
                        $set: {
                            'firstName': request.auth.credentials.firstName,
                            'lastName': request.auth.credentials.lastName,
                            'googleId': request.auth.credentials.googleId,
                            'googleProfileURL': request.auth.credentials.googleProfileURL,
                            'profilePicture': request.auth.credentials.profilePicture,
                        }
                    },
                    {
                        new: true
                    }
                )
                    .then((result) => {
                        dataToSendBack = result

                        request.cookieAuth.clear()

                        request.cookieAuth.set({
                            emailId: result.emailId,
                            id: result._id,
                            rLId: result.rLId
                        })

                    })
                    .catch((err) => {
                        return h.response(err)
                    })
            }


            if (userIsTaken === false) {
                await NewUser.create(
                    {
                        ...request.auth.credentials,
                        'rLId': createUserRLId(type),
                    }
                )
                    .then((newUser) => {
                        dataToSendBack = { ...newUser._doc, itsTaken: false }

                        request.cookieAuth.clear()

                        request.cookieAuth.set({
                            emailId: newUser.emailId,
                            id: newUser._id,
                            rLId: newUser.rLId
                        })

                        NewVendor.create(
                            {
                                rLId: newUser.rLId
                            }
                        )
                        .then((vendorData) => {
                            // dataToSendBack = { ...vendorData._doc }
        
                            // // 
                            // // Encrypt data
                            // // 
                            // dataToSendBack = {
                            //     responseData: DataEncrypterAndDecrypter.encryptData(dataToSendBack),
                            //     message: "Vendor Details created successfully"
                            // }
                            // // 
                            // // Encrypt data
                            // // 
        
                        })
                        .catch((err) => {
                            console.log(err)
                            return h.response(err)
                        })
                    })
                    .catch((err) => {
                        console.log(err)
                        return h.response(err)
                    })

            }

            return h.view('googleLayout', {
                name: request.auth.credentials.firstName,
                url: type === "commonUser" ? "https://rollinglogs.com" : config.reactConfig.frontCredentials.theURL
            })
        }
    }
}

let linkedInViewVendor = {
    method: 'GET',
    path: '/api/user/login-linkedin-user',
    config: {
        cors: corsHeaders,
        auth: {
            strategy: 'restricted',
        },
        tags: ['api'],
        handler: async (request, h) => {

            // check if username exists and create if he/she doesn't
            let userIsTaken
            let dataToSendBack

            const { type } = request.query

            await NewUser.findOne({
                emailId: request.auth.credentials.emailId
            })
                .then(result => {
                    if (result) {
                        userIsTaken = true
                        dataToSendBack = result
                    }

                    else {
                        userIsTaken = false
                    }


                })
                .catch(e => h.response(e))

            if (userIsTaken) {

                await NewUser.findOneAndUpdate(
                    {
                        emailId: request.auth.credentials.emailId
                    },
                    {
                        $set: {
                            'firstName': request.auth.credentials.firstName,
                            'lastName': request.auth.credentials.lastName,
                            'linkedinId': request.auth.credentials.linkedinId,
                            'linkedinProfileURL': request.auth.credentials.linkedinProfileURL,
                            'professionalTitle': request.auth.credentials.professionalTitle,
                            'profilePicture': request.auth.credentials.profilePicture
                        }
                    },
                    {
                        new: true
                    }
                )
                    .then((result) => {
                        dataToSendBack = result

                        request.cookieAuth.clear()

                        request.cookieAuth.set({
                            emailId: result.emailId,
                            id: result._id,
                            rLId: result.rLId
                        })

                        // console.log(result._id)


                    })
                    .catch((err) => {
                        return h.response(err)
                    })
            }


            if (userIsTaken === false) {
                await NewUser.create(
                    {
                        ...request.auth.credentials,
                        'rLId': createUserRLId(type),
                    }
                )
                    .then((newUser) => {
                        dataToSendBack = { ...newUser._doc, itsTaken: false }

                        request.cookieAuth.clear()

                        request.cookieAuth.set({
                            emailId: newUser.emailId,
                            id: newUser._id,
                            rLId: newUser.rLId
                        })

                        NewVendor.create(
                            {
                                rLId: newUser.rLId
                            }
                        )
                        .then((vendorData) => {
                            // dataToSendBack = { ...vendorData._doc }
        
                            // // 
                            // // Encrypt data
                            // // 
                            // dataToSendBack = {
                            //     responseData: DataEncrypterAndDecrypter.encryptData(dataToSendBack),
                            //     message: "Vendor Details created successfully"
                            // }
                            // // 
                            // // Encrypt data
                            // // 
        
                        })
                        .catch((err) => {
                            console.log(err)
                            return h.response(err)
                        })
                    })
                    .catch((err) => {
                        return h.response(err)
                    })

            }

            return h.view('linkedinLayout', {
                name: request.auth.credentials.firstName,
                url: type === "commonUser" ? "https://rollinglogs.com" : config.reactConfig.frontCredentials.theURL
            })
        }
    }
}








/// LOGIN
let userLogin = {
    method: "POST",
    path: "/api/user/login",

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
            password: Joi.string().min(6).max(30).required(),
            emailId: Joi.string().email({ minDomainAtoms: 2 }).required(),            
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

            let { password, emailId } = decryptedData
            let dataToSendBack, temp, id, userNotRegistered = false
    
            emailId = emailId.toLowerCase()

            if(password !== "1234"){
                // check if email exists
                await NewUser.findOne({
                    emailId: emailId
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

                    const rLId = temp._doc.rLId

                    await Bcrypt.compare(password, temp._doc.password)
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

                                request.cookieAuth.set({ emailId, id, rLId })
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

let getUserDetails = {
    method: "GET",
    path: "/api/user/get-user-data",

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
            await NewUser.findOne({
                emailId: request.auth.credentials.emailId
            })
            .then(result => {
                if (result) {
                    dataToSendBack = { ...result._doc, userFound: true }
                    // 
                    // Encrypt data
                    // 
                    dataToSendBack = {
                        responseData: DataEncrypterAndDecrypter.encryptData(dataToSendBack),
                        message: "User credentials found"
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
                        message: "User credentials not found"
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

let checkForAuth = {
    method: "GET",
    path: "/api/user/check-for-auth",

    config: {
        cors: corsHeaders,
        auth: {
            strategy: 'restricted',
            mode: "try"
        },
        tags: ['api'],
    },
    handler: async (request, h) => {
        const { credentials } = request.auth;

        // console.log(credentials);

        // const { emailId } =  request.payload
        let dataToSendBack 

        if(credentials){
            if(credentials.emailId) {
                await NewUser.findOne({
                    emailId: request.auth.credentials.emailId
                })
                .then(result => {
                    if (result) {
                        dataToSendBack = { ...result._doc, userFound: true }

                        console.log(dataToSendBack);
                    }
    
                    else {
                        dataToSendBack = { userFound: false }
                    }
                })
                .catch(e => h.response(e))
    
                dataToSendBack = {
                    isAuthenticated : true,
                    profilePicture : dataToSendBack.profilePicture,
                    firstName : dataToSendBack.firstName,
                    lastName : dataToSendBack.lastName,
                    emailId : dataToSendBack.emailId,
                    rLId : dataToSendBack.rLId
                }
            }
            else{
                dataToSendBack = {
                    isAuthenticated : false
                }
            }
        }

        else{
            dataToSendBack = {
                isAuthenticated : false
            }
        }

        // 
        // Encrypt data
        // 
        dataToSendBack = {
            responseData: DataEncrypterAndDecrypter.encryptData(dataToSendBack),
            message: "Authentication test performed successfully"
        }
        // 
        // Encrypt data
        // 


        return h.response(dataToSendBack)
    }
}

let updateUserData = {
    method: "PUT",
    path: "/api/user/update-user-data",

    config: {
        cors: corsHeaders,
        auth: {
            strategy: 'restricted',
        },
        tags: ['api'],
        validate : {
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
            firstName: Joi.string().max(30),
            lastName: Joi.string().max(30),
            mobileNo: Joi.number().integer().max(9999999999),
            whatsappNo: Joi.number().integer().max(9999999999).allow(null),
            profilePicture: Joi.string()
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

            const {
                firstName,
                lastName,
                mobileNo,
                whatsappNo
            } = decryptedData
    
    
            if(decryptedData.firstName)
                decryptedData.firstName = decryptedData.firstName.charAt(0).toUpperCase() + firstName.toLowerCase().slice(1)
    
            if (decryptedData.lastName)
                decryptedData.lastName = decryptedData.lastName.charAt(0).toUpperCase() + lastName.toLowerCase().slice(1)
    
            let dataToSendBack
            const emailId = request.auth.credentials.emailId
    
            // check if email exists
                await NewUser.findOneAndUpdate(
                    {
                        emailId: request.auth.credentials.emailId
                    },
                    {
                        $set: decryptedData
                    },
                    {
                        new: true
                    }
                )
    
                .then((result) => {
                    dataToSendBack = result
                })
    
                .catch((err) => {
                    return h.response(err)
                })
    
                // 
                // Encrypt data
                // 
                dataToSendBack = {
                    responseData: DataEncrypterAndDecrypter.encryptData(dataToSendBack),
                    message: "User credentials updated"
                }
                // 
                // Encrypt data
                // 
            
    
            return h.response(dataToSendBack)
        }
    }
}

let signOut = {
    method: "GET",
    path: "/api/user/sign-out",

    config: {
        cors: corsHeaders,
        auth: {
            strategy: 'restricted',
        },
        tags: ['api'],
    },

    handler: async (request, h) => {
        request.cookieAuth.clear()
        return h.view('userSignOut', {
            url:  config.reactConfig.frontCredentials.theURL
        })
    }
}

let userSignOut = {
    method: "GET",
    path: "/api/user/user-sign-out",

    config: {
        cors: corsHeaders,
        auth: {
            strategy: 'restricted',
            mode: 'try'
        },
        tags: ['api'],
    },

    handler: async (request, h) => {
        request.cookieAuth.clear()
        return h.view('userSignOut', {
            url:  "https://rollinglogs.com"
        })
    }
}

let UserDataRoute = [
    createUser,

    // Vendor Knocks
    googleKnockVendor,
    linkedInKnockVendor,
    // Vendor Knocks

    // CommonUser Knocks
    googleKnockCommonUser,
    linkedInKnockCommonUser,
    // CommonUser Knocks



    googleViewVendor,
    linkedInViewVendor,

    userLogin,
    getUserDetails,
    checkForAuth,
    updateUserData,
    
    signOut,
    userSignOut

    /////
    // justTest,
    /////
]

module.exports = UserDataRoute