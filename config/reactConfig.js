'use strict'
const isDev = process.env.NODE_ENV.trim() !== "production"

const frontCredentials = {
    theURL : isDev ? 'http://localhost:3000' : 'https://vendor.rollinglogs.com',
}

module.exports = {
    frontCredentials: frontCredentials
}