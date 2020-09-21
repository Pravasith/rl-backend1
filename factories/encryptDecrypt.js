const CryptoJS = require('crypto-js')
const Config = require('../config')

// 
// This is for the back-end
// 

const encryptData = (message) => {
    // Encrypt
    let ciphertext = CryptoJS
        .AES
        .encrypt(JSON.stringify(message) , Config.encryptDecryptKey)

    return ciphertext.toString()
}

const decryptData = (ciphertext) => {
    // Decrypt
    let bytes = CryptoJS
        .AES
        .decrypt(ciphertext, Config.encryptDecryptKey)

    let decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8))

    return decryptedData
}

module.exports = {
    encryptData,
    decryptData
}

