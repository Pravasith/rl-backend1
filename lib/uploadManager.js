'use strict'

const fs = require('fs')
const Path = require('path')
const AWS = require('aws-sdk')

const CONFIG = require('../config')

const Cloudinary = require('cloudinary')

Cloudinary.config({ 
    cloud_name: 'rolling-logs', 
    api_key: '613742133312325', 
    api_secret: '-ioPEEehWMBMv9kKYLvu0_H8Qv0' 
})


const s3BucketCredentials =  CONFIG.awsS3Config.s3BucketCredentials

let uploadImageToS3Bucket = function(theFile, fileStorageDestination) {

    const accessKeyId = CONFIG.awsS3Config.s3BucketCredentials.accessKeyId
    const secretAccessKeyId = CONFIG.awsS3Config.s3BucketCredentials.secretAccessKey

    const mimeType = theFile.hapi.headers["content-type"]

    const imageName = theFile.hapi.filename
    
    const getImageType = () => {
        const tempArr = imageName.split('-')

        if(tempArr[0] === "regularImage")
        return "regularImage"

        else if(tempArr[0] === "profileImage")
        return "profileImage"
    }

    const getUserType = () => {
        const tempArr = imageName.split('-')

        if(tempArr[1] === "STU")
        return "student"

        else if(tempArr[1] === "ARC")
        return "architect"

        else if(tempArr[1] === "VEN")
        return "vendor"

        else if(tempArr[1] === "CLI")
        return "client"
    }

    const imageType = getImageType()
    const userType = getUserType()

    return new Promise(function(resolve, reject){
        fs.readFile(fileStorageDestination, function(error, bufferData){
            if(error) {
                console.error('Error in reading file', error, bufferData)
                let errResp = {
                    response: {
                        message: "Your file was uploaded, but our server couldn't read it :(",
                        data: {}
                    },
                    statusCode: 500
                }

                reject(errResp) 
            }

            AWS.config.update({
                accessKeyId:accessKeyId,
                secretAccessKey: secretAccessKeyId
            })

            let s3Bucket = new AWS.S3()
            let params = {
                // Bucket: s3BucketCredentials.bucket,
                Key: imageName,
                Body: bufferData,
                ACL: 'public-read',
                ContentType: mimeType
            }

            const addBucketToParams = () => {

                if(imageType === "profileImage"){
                    params = {
                        ...params,
                        Bucket: s3BucketCredentials.bucket.images[userType].profilePictures
                    }
                }

                else if(imageType === "regularImage"){
                    params = {
                        ...params,
                        Bucket: s3BucketCredentials.bucket.images[userType].regularImages
                    }
                }
                
            }

            addBucketToParams()

            s3Bucket.putObject(params, function (err, data) {
                
                if (err) {
                    console.error("PUT", err, data)
                    let error = {
                        response: {
                            message: "Error in uploading to our main server",
                            data: {}
                        },
                        statusCode: 500
                    };
                    reject(error)
                }

                else {
                    // fs.unlink( fileStorageDestination, function (err) {
                    //     if (err){
                    //         console.error(err)
                    //         reject(err)
                    //     }

                        // else{
                    if(imageType === "profileImage")
                    resolve({
                        successfullyUploaded: true,
                        imageURL: CONFIG.awsS3Config.s3BucketCredentials.s3URL + s3BucketCredentials.bucket.images[userType].profilePictures + '/' + imageName,
                    })

                    else if(imageType === "regularImage")
                    resolve({
                        successfullyUploaded: true,
                        s3ImageURL: CONFIG.awsS3Config.s3BucketCredentials.s3URL + s3BucketCredentials.bucket.images[userType].regularImages + '/' + imageName,
                    })
                        // }
                            
                    // })
                }
            })

            .on('httpUploadProgress', function (progress) {
                console.log(progress.loaded + " of " + progress.total + " bytes loaded")
            })
        })
    })
}

let uploadToCloudinary = (fileStorageDestination, uploadName) => {

    return new Promise((resolve, reject) => {
        Cloudinary.v2.uploader.upload(
                fileStorageDestination,
                // {
                //     eager: [
                //         // { width: 400, height: 300, crop: "pad" }, 
                //         { width: 400 },
                //         // { angle: 20 }
                //     ]
                // },
                {
                    public_id: uploadName.split('.')[0],
                    tags : ["architect", "vendor", "products", "interior design"]
                },
                (error, result) => {
                    if(error) reject({
                        message : "There has been an error in uploading to Cloudinary"
                    })

                    else{
                        resolve({
                            successfullyUploaded : true,
                            cloudinaryImageData : result,
                            imageURL : result.secure_url
                        })
                    }
                },
            )

    })

    
}

module.exports = {
    uploadImageToS3Bucket,
    uploadToCloudinary
}