'use strict'

const Joi = require('joi')

const fs = require('fs')
const Path = require('path')


const NewUser = require('../../models/newUsers')

const CONFIG = require('../../config')
const uploadManager = require('../../lib/uploadManager')


const corsHeaders = require('../../lib/routeHeaders')


let uploadImage = {
    method: "POST",
    path: "/api/common/upload-image",
    
    config: {
        cors: corsHeaders,
        payload: {
            maxBytes: 1024 * 1024 * 1, // 1 Mb
            output: 'stream',
            allow:'multipart/form-data',
            parse: true
          },
        auth: {
            strategy: 'restricted',
            mode : 'try'
        },
        validate:{
            
//////////// VERY- IMP - Remove this if problems persist in uploads
            payload: Joi.object({
                toxicData: Joi.object(
                    {
                    domain: Joi.allow(null),
                    hapi: Joi.object({
                        filename: Joi.string(),
                        headers: Joi.object({
                            "content-disposition": Joi.any(),
                            "content-type": Joi.string().valid("image/gif", "image/jpg", "image/jpeg", "image/png")
                        })
                    }),
                    readable: Joi.boolean(),
                    _data: Joi.binary(),
                    _encoding: Joi.string(),
                    _events: Joi.object(),
                    _eventsCount: Joi.number(),
                    _position: Joi.number(),
                    _readableState: Joi.object(),
                    _maxListeners: Joi.any()
                    }
                )
            })
////////////////////////////////////////////////////////////////////
        }
        
    },
    handler: async (request, h) => {

        let comebackData

        const uploadData = request.payload.toxicData
        const uploadName = Path.basename(request.payload.toxicData.hapi.filename)
        const destination = Path.join(__dirname, 'uploads', uploadName)

        // let myWriteStream = fs.createWriteStream(destination)
        fs.writeFileSync(destination, uploadData._data)

        // console.log(destination)

        // // var stream = cloudinary.v2.uploader.upload_stream(function(error, result){console.log(result, error)});

        
        await Promise.all([
            uploadManager.uploadToCloudinary(destination, uploadName),
            uploadManager.uploadImageToS3Bucket(uploadData, destination)
        ])
        .then( async imageData => {

            // console.log(imageData)

            let unlinkError = false
            await fs.unlink( destination, function (err) {
                if (err){
                    console.error(err)
                    unlinkError = true
                }
            })

            if(unlinkError) {
                comebackData = {
                    message : "There has been an error in uploading image, try again"
                }
            }

            else{
                comebackData = imageData.reduce((all, item, i) => {
                    all = {
                        ...all,
                        ...item
                    }
                    return all
                }, {})
            }
        })
        .catch((err) => {
            fs.unlink( destination, function (err) {
                if (err){
                    console.error(err)
                }     
            })
            console.error(err)
            comebackData = {
                message : "There has been an error in uploading image, try again"
            }
        })

        // await uploadManager.uploadImageToS3Bucket(uploadData, destination)
        // .then((val) => {
        //     // console.log(val.imageURL)
        //     comebackData = val
        // })
        // .catch((err) => {
        //     console.error('Our bad, we could\'nt upload the image to the server', err )
        // })

        return h.response(comebackData).code(201)
    }
}

let uploadRoute = [
    uploadImage
]

module.exports = uploadRoute