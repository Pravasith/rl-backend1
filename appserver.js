'use strict'

// External Dependencies
const Hapi = require('hapi')
const HapiAuthCookie = require('hapi-auth-cookie')
const mongoose = require('mongoose')
const Bell = require('bell')
const Inert = require('inert')
const Vision = require('vision')
const fs = require('fs')

// Internal Dependencies
const Routes = require('./routes')
const configs = require('./config')

const isDev = process.env.NODE_ENV.trim() !== "production"

let serverOptions 

if(isDev){
    serverOptions = {
        host: "localhost",
        port: process.env.PORT || 8000,
    }
}

else{


    serverOptions = {
        host: "localhost",
        port: process.env.PORT || 8000,
    }
}



// create server
const server = Hapi.server(serverOptions)


// connect to mongodb
mongoose.connect(
    configs.dbConfig.mongodbCredentials.connectUrl,
    {
        useNewUrlParser: true
    }
)

mongoose.Promise = global.Promise



const start = async () => {

    await server.register([
        Inert,
        Vision,
        HapiAuthCookie,
        Bell,

        // {
        //     plugin: HapiSwagger,
        //     options: swaggerOptions
        // },
        // {
        //     plugin: Nes,
        //     options: {
        //         auth: {
        //             type: 'cookie',
        //             cookie: 'ws-auth',
        //             password: configs.authConfig.hapiAuthCookieCredentials.password,
        //             ttl: 24 * 60 * 60 * 1000,
        //             isSecure: process.env.NODE_ENV !== 'development',
        //             isHttpOnly: false,
        //             // route: 'session', // our default auth (cookie) strategy is named 'default'
        //         }
        //     }
        // }
    ])

    server.views({
        engines: {
            html: require("handlebars")
        },
        path: './views',
        // layout : 'default-layout'
    })

    // console.log(server.info.uri)


    server.auth.strategy('linkedin', 'bell', {
        provider: 'linkedin',
        password: configs.authConfig.bellCredentials.linkedin.password,
        isSecure: false,
        clientId: configs.authConfig.bellCredentials.linkedin.clientId,
        clientSecret: configs.authConfig.bellCredentials.linkedin.clientSecret,
        location: isDev ? server.info.uri : 'https://api.rollinglogs.com',

        providerParams: {
            // redirect_uri: isDev ? 'server.info.uri' + '/knock/linkedin',
            fields: ':(id,firstName,lastName,email-address,siteStandardProfileRequest,headline,picture-url)'
        }
    })

    server.auth.strategy('google', 'bell', {
        provider: 'google',
        password: configs.authConfig.bellCredentials.google.password,
        isSecure: false,
        clientId: configs.authConfig.bellCredentials.google.clientId,
        clientSecret: configs.authConfig.bellCredentials.google.clientSecret,
        location: isDev ? server.info.uri : 'https://api.rollinglogs.com',
    })

    server.auth.strategy('restricted', 'cookie',{
        password: configs.authConfig.hapiAuthCookieCredentials.password,
        cookie: 'session',
        isSecure: false,
        ttl: 7 * 24 * 60 * 60 * 1000,
        isSameSite: false,
    })

    await server.route({
        method: "GET",
        path: "/",
    
        handler : (request, h) => {
            return "WELCOME TO ROLLING LOGS DAWG"
        }
    })

    await server.route(Routes)

    try{
        await server.start()
    }

    catch(err){
        console.log(err)
        process.exit(1)
    }

    console.log(`Server is running at ${server.info.uri}. Press ctrl^C to terminate`)
}


// Start the server
start()