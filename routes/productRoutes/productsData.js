'use strict'

// External dependencies
const Joi = require('joi')
const Bcrypt = require('bcryptjs')

const NewCategory = require('../../models/newCategories')
const NewEmptyCategories = require('../../models/newEmptyCategories')
const NewProduct = require('../../models/newProducts')
const CategoryCodes = require('../../lib/categoryCodes')
const NewCount = require('../../models/newCount')
const CategoryNames = require('../../lib/categoryNames')
const NewVendor = require('../../models/newVendors')

const DataEncrypterAndDecrypter = require('../../factories/encryptDecrypt')

const corsHeaders = require('../../lib/routeHeaders')

const unitsPlaceConverter = (theNumber) => {
    if (theNumber < 10) {
        return "000" + theNumber
    }

    else if (theNumber >= 10 && theNumber < 100) {
        return "00" + theNumber
    }

    else if (theNumber >= 100 && theNumber < 1000) {
        return "0" + theNumber
    }

    else {
        return "" + theNumber
    }
}


// let xx = {
//     method: "GET",
//     path: "/api/categories/ppp",
//     config: {
//         cors: corsHeaders,
//         auth: {
//             strategy: 'restricted',
//             mode: 'try'
//         },
//         tags: ['api'],
//     },
//     handler: async (request, h) => {
//         NewCount.create(
//             {
//                 categoryCount : 32,
//                 subCategoryCount : 84,
//                 productTypeCount : 881,
//                 productCount : 0,
//             }
//         )
//         return "DONE"
//     }
// }


// let addNewProduct = {
//     method: "POST",
//     path: "/api/categories/add-new-product",

//     config: {
//         cors: corsHeaders,
//         auth: {
//             strategy: 'restricted',
//         },
//         tags: ['api'],
//         validate: {
//             payload: {
//                 requestData: Joi.string(),
//                 message: Joi.string(),
//             }
//         }
//     },
//     handler: async (request, h) => {

//         let { requestData, message } = request.payload

//         //
//         // DECRYPT REQUEST DATA
//         //
//         let decryptedData = DataEncrypterAndDecrypter.decryptData(requestData)
//         //
//         // DECRYPT REQUEST DATA
//         //


//         /////// VALIDATE PAYLOAD //////////////////////////////////////
//         let dataPassesValidation = false



//         const schema = Joi.object().keys({

//             productName : Joi.string().max(60).required(), // verified frontend
//             productCode : Joi.string().max(30).required(), // verified frontend
//             basePrice : Joi.number().integer().max(99999999).required().allow(null), // verified frontend
//             gstPercentage : Joi.number().max(100).required(),
//             productMaterials : Joi.array().items(
//                 Joi.object().keys({
//                     materialCost : Joi.number().integer().max(99999999).required(), // verified frontend
//                     materialName : Joi.string().max(60).required(), // verified frontend
//                     materialGrade : Joi.string().max(30).allow(null, "") // verified frontend
//                 })
//             ).required(), // verified frontend
//             finishingOptions : Joi.array().items(
//                 Joi.object().keys({
//                     finishName : Joi.string().max(30).required(), // verified frontend
//                     finishCode : Joi.string().max(30).allow(null, ""), // verified frontend
//                     finishImage : Joi.string().required(), // verified frontend
//                     finishCost : Joi.number().max(99999999)  // verified frontend
//                 })
//             ).required(), // verified frontend
//             colorOptions : Joi.array().items(
//                 Joi.object().keys({
//                     colorName : Joi.string().max(30).required(), // verified frontend
//                     colorCode : Joi.string().max(7).required(), // verified frontend
//                     colorCost : Joi.number().max(99999999) // verified frontend
//                 })
//             ).required(), // verified frontend
//             sizesAvailable : Joi.array().items(
//                 Joi.object().keys({
//                     sizeName : Joi.string().max(100), // verified frontend
//                     sizeCost : Joi.number().max(99999999) // verified frontend
//                 })
//             ), // verified frontend
//             minQuantity : Joi.number().max(99999999).required(), // verified frontend
//             maxQuantity : Joi.number().max(99999999).required(), // verified frontend
//             productDescription : Joi.string().max(500).required(), // verified frontend
//             features : Joi.array().items(
//                 Joi.string().max(200).allow(null, ""), // verified frontend
//             ),
//             designStyles : Joi.array().items(
//                 Joi.object().keys({
//                     styleId : Joi.number(), // verified frontend
//                     styleName : Joi.string().max(30).required() // verified frontend
//                 })
//             ).required(), // verified frontend
//             productTypeId : Joi.string().max(21).required(), // verified frontend
//             tags : Joi.array().items(
//                 Joi.string().max(40) // verified frontend
//             ).required(), // verified frontend
//             availability : Joi.boolean().required(), // verified frontend
//             // productRating : Joi.number().max(5),
//             discount : Joi.number().max(100).required(), // verified frontend
//             productImages : Joi.array().items(
//                 Joi.object().keys({
//                     itemCode : Joi.string().max(100).allow(null, "").required(), // verified frontend
//                     textOnRibbonSatisfied : Joi.boolean().required(), // verified frontend
//                     imageURL : Joi.string().max(2048).required() // verified frontend
//                 })
//             ).required(), // verified frontend
//             productThumbImage : Joi.string().max(2048).required(), // verified frontend
//             youTubeAdVideos : Joi.array().items(
//                 Joi.string()
//             ),
//             brandName : Joi.string().max(30).allow(null, ""),
//             brandImage : Joi.string().max(2048).allow(null, ""),

//             productInstallers : Joi.array().items(
//                 Joi.object().keys({
//                     installerName : Joi.string().max(30) ,
//                     installerContactNo: Joi.number().max(9999999999),
//                     installerCharges : Joi.number().max(99999),
//                     installerChargeType: Joi.number().max(10),
//                 })
//             ),
//             productInstallationAvailability : Joi.number().max(10),
//             productInstallationServiceCost : Joi.number().max(99999),
//             installationServiceCostType : Joi.number().max(10)

//         })

//         await Joi.validate(decryptedData, schema)
//         .then((val) => {
//             dataPassesValidation = true
//         })
//         .catch(e => {
//             console.error(e)
//             return h.response(e)
//         })
//         /////// VALIDATE PAYLOAD //////////////////////////////////////

//         const { rLId } = request.auth.credentials

//         let dataToSendBack, productCount

//         if(dataPassesValidation === true){

//             let productAlreadyExists = false
//             let {
//                 productName,
//                 productCode,
//                 basePrice,
//                 gstPercentage,
//                 productMaterials,
//                 finishingOptions,
//                 colorOptions,
//                 sizesAvailable,
//                 minQuantity,
//                 maxQuantity,
//                 productDescription,
//                 features,
//                 designStyles,
//                 productTypeId,
//                 tags,
//                 availability,
//                 productRating,
//                 discount,
//                 productImages,
//                 productThumbImage,
//                 youTubeAdVideos,
//                 brandName,
//                 brandImage,
//                 productInstallers,
//                 productInstallationAvailability,
//                 productInstallationServiceCost,
//                 installationServiceCostType,
//             } = decryptedData



//             // // check if email exists
//             // await NewProduct.findOne({
//             //     product_lowerCased_name : productName.toLowerCase()
//             // })
//             // .then(result => { /////////////////////////////////////////////////////////////////////////////////////
//             //     if (result) {

//             //         productAlreadyExists = true
//             //         dataToSendBack = {
//             //             // ...result._doc,
//             //             // productFound: true 
//             //             productAlreadyExists
//             //         }

//             //         // 
//             //         // Encrypt data
//             //         // 
//             //         dataToSendBack = {
//             //             responseData: DataEncrypterAndDecrypter.encryptData(dataToSendBack),
//             //             message: "Product found"
//             //         }
//             //         // 
//             //         // Encrypt data
//             //         // 
//             //     }

//             //     else {
//             //         dataToSendBack = { productFound: false }

//             //         // 
//             //         // Encrypt data
//             //         // 
//             //         dataToSendBack = {
//             //             responseData: DataEncrypterAndDecrypter.encryptData(dataToSendBack),
//             //             message: "Product not found"
//             //         }
//             //         // 
//             //         // Encrypt data
//             //         // 
//             //     }
//             // })
//             // .catch(e => h.response(e))

//             productAlreadyExists = false

//             if(!productAlreadyExists){

//                 // check product code from existing count
//                 // update count after the request for create is successful

//                 let productId

//                 await NewCount.findOne(
//                     {
//                         selectMe : "selectMe",
//                     }
//                 )
//                 .then( result => {
//                     // categoryCount = result.categoryCount
//                     // subCategoryCount = result.subCategoryCount
//                     // productTypeCount = result.productTypeCount
//                     productCount = result.productCount
//                 })
//                 .catch(e => h.response(e))



//                 // add product to db
//                 await NewProduct.create(
//                     {
//                         rLId,
//                         productId: productTypeId + "-P" + unitsPlaceConverter(productCount),
//                         productName,
//                         product_lowerCased_name: productName.toLowerCase(),
//                         productCode,
//                         basePrice,
//                         gstPercentage,
//                         productMaterials,
//                         finishingOptions,
//                         colorOptions,
//                         sizesAvailable,
//                         minQuantity,
//                         maxQuantity,
//                         productDescription,
//                         features,
//                         designStyles,
//                         tags,
//                         availability,
//                         productRating,
//                         discount,
//                         productImages,
//                         productThumbImage,
//                         productRating : 0,
//                         youTubeAdVideos,
//                         brandName,
//                         brandImage,
//                         productInstallers,
//                         productInstallationAvailability,
//                         productInstallationServiceCost,
//                         installationServiceCostType,
//                     }
//                 )
//                 .then((productData) => {
//                     dataToSendBack = productData

//                     productId = productData.productId

//                     // 
//                     // Encrypt data
//                     // 
//                     dataToSendBack = {
//                         responseData: DataEncrypterAndDecrypter.encryptData(dataToSendBack),
//                         message: "Product created successfully"
//                     }
//                     // 
//                     // Encrypt data
//                     // 

//                 })
//                 .catch((err) => {
//                     console.log(err)
//                     return h.response(err)
//                 })

//                 await NewCount.findOneAndUpdate(
//                     {
//                         selectMe : "selectMe",
//                     },
//                     {
//                         $inc: {
//                             productCount : 1
//                         }
//                     },
//                     {
//                         new: true
//                     }
//                 )
//                 .then( result => {

//                     dataToSendBack = {
//                         ...dataToSendBack,
//                         extraMessage : "Incremented product type count to " + result.productCount
//                     }

//                     // if(result){
//                     //     productTypeAlreadyExists = true
//                     // }

//                     // else{
//                     //     productTypeAlreadyExists = false
//                     // }
//                 })
//                 .catch(e => h.response(e))

//                 const getCategoryId = () => {
//                     const categoryId = productId.split("-")
//                     return categoryId[0].toUpperCase()
//                 }

//                 const getSubCategoryId = () => {
//                     const categoryId = productId.split("-")
//                     return categoryId[0].toUpperCase() + "-" + categoryId[1].toUpperCase()
//                 }

//                 const categoryId = getCategoryId()
//                 const subCategoryId = getSubCategoryId()


//                 let categoryName = CategoryNames[categoryId]
//                 let productTypes = []
//                 let subCategoryName

//                 await NewCategory[categoryName].findOne(
//                     {
//                         subCategoryId
//                     }
//                 )
//                 .then( result => {
//                     productTypes = result.productTypes
//                     subCategoryName = result.subCategoryName
//                 })
//                 .catch(e => h.response(e))

//                 productTypes = productTypes.map((item, i) => {
//                     if(item.productTypeId === productTypeId){
//                         item.products.push({
//                             productId : productId,
//                             thumb : productThumbImage,
//                             subCategoryName,
//                             productName
//                         })
//                     }

//                     return item
//                 })



//                 await NewCategory[categoryName].findOneAndUpdate(
//                     {
//                         subCategoryId
//                     },
//                     {
//                         productTypes
//                     }
//                 )
//                 .then( result => {
//                     dataToSendBack = {
//                         ...dataToSendBack,
//                         anotherExtraMessage : "Added to sub-category " + subCategoryId
//                     }
//                 })
//                 .catch(e => {
//                     console.error(e)
//                     return h.response(e)
//                 })



//                 await NewVendor.findOneAndUpdate(
//                     {
//                         rLId
//                     },
//                     {
//                         $push : {
//                             products : {
//                                 productId : productId,
//                                 thumb : productThumbImage,
//                                 subCategoryName,
//                                 productName
//                             }
//                         }
//                     },
//                     {
//                         new : true
//                     }
//                 )
//                 .then((result) => {
//                     dataToSendBack = {
//                         ...dataToSendBack,
//                         lastMessage : "Added to " + result.companyName
//                     }
//                 })
//                 .catch(e => {
//                     console.error(e)
//                     return h.response(e)
//                 })

//             }
//         }

//         else{
//             dataToSendBack = {
//                 message : "Wrong data"
//             }


//             // 
//             // Encrypt data
//             // 
//             dataToSendBack = {
//                 responseData: DataEncrypterAndDecrypter.encryptData(dataToSendBack),
//                 message: "TOXIC_DATA_ACTIVATED>LOCATION_TRACKED>196.0.0.1"
//             }
//             // 
//             // Encrypt data
//             // 
//         }


//         return h.response(dataToSendBack)
//     }
// }




let addNewProduct = {
    method: "POST",
    path: "/api/categories/add-new-product",

    config: {
        cors: corsHeaders,
        auth: {
            strategy: 'restricted',
        },
        tags: ['api'],
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

            productName: Joi.string().max(60).required(), // verified frontend
            productCode: Joi.string().max(30).required(), // verified frontend
            basePrice: Joi.number().integer().max(99999999).required().allow(null), // verified frontend
            priceNotation: Joi.number().max(30).required(),
            gstPercentage: Joi.number().max(100).required(),
            productMaterials: Joi.array().items(
                Joi.object().keys({
                    materialCost: Joi.number().integer().max(99999999).required(), // verified frontend
                    materialName: Joi.string().max(60).required(), // verified frontend
                    materialGrade: Joi.string().max(30).allow(null, "") // verified frontend
                })
            ).required(), // verified frontend
            finishingOptions: Joi.array().items(
                Joi.object().keys({
                    finishName: Joi.string().max(30).required(), // verified frontend
                    finishCode: Joi.string().max(30).allow(null, ""), // verified frontend
                    finishImage: Joi.string().required(), // verified frontend
                    finishCost: Joi.number().max(99999999)  // verified frontend
                })
            ).required(), // verified frontend
            colorOptions: Joi.array().items(
                Joi.object().keys({
                    colorName: Joi.string().max(30).required(), // verified frontend
                    colorCode: Joi.string().max(7).required(), // verified frontend
                    colorCost: Joi.number().max(99999999) // verified frontend
                })
            ).required(), // verified frontend
            sizesAvailable: Joi.array().items(
                Joi.object().keys({
                    sizeName: Joi.string().max(100), // verified frontend
                    sizeCost: Joi.number().max(99999999) // verified frontend
                })
            ), // verified frontend
            minQuantity: Joi.number().max(99999999).required(), // verified frontend
            maxQuantity: Joi.number().max(99999999).required(), // verified frontend
            productDescription: Joi.string().max(500).required(), // verified frontend
            features: Joi.array().items(
                Joi.string().max(200).allow(null, ""), // verified frontend
            ),
            designStyles: Joi.array().items(
                Joi.object().keys({
                    styleId: Joi.number(), // verified frontend
                    styleName: Joi.string().max(30).required() // verified frontend
                })
            ).required(), // verified frontend
            productTypeId: Joi.string().max(21).required(), // verified frontend
            tags: Joi.array().items(
                Joi.string().max(40) // verified frontend
            ).required(), // verified frontend
            availability: Joi.boolean().required(), // verified frontend
            // productRating : Joi.number().max(5),
            discount: Joi.number().max(100).required(), // verified frontend
            productImages: Joi.array().items(
                Joi.object().keys({
                    itemCode: Joi.string().max(100).allow(null, "").required(), // verified frontend
                    textOnRibbonSatisfied: Joi.boolean().required(), // verified frontend
                    imageURL: Joi.string().max(2048).required() // verified frontend
                })
            ).required(), // verified frontend
            productThumbImage: Joi.string().max(2048).required(), // verified frontend
            youTubeAdVideos: Joi.array().items(
                Joi.string()
            ),
            brandName: Joi.string().max(30).allow(null, ""),
            brandImage: Joi.string().max(2048).allow(null, ""),

            productInstallers: Joi.array().items(
                Joi.object().keys({
                    installerName: Joi.string().max(30),
                    installerContactNo: Joi.number().max(9999999999),
                    installerCharges: Joi.number().max(99999),
                    installerChargeType: Joi.number().max(10),
                })
            ),
            productInstallationAvailability: Joi.number().max(10),
            productInstallationServiceCost: Joi.number().max(99999),
            installationServiceCostType: Joi.number().max(10)

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

        const { rLId } = request.auth.credentials

        let dataToSendBack, productCount

        if (dataPassesValidation === true) {

            let productAlreadyExists = false
            let {
                productName,
                productCode,
                basePrice,
                priceNotation,
                gstPercentage,
                productMaterials,
                finishingOptions,
                colorOptions,
                sizesAvailable,
                minQuantity,
                maxQuantity,
                productDescription,
                features,
                designStyles,
                productTypeId,
                tags,
                availability,
                productRating,
                discount,
                productImages,
                productThumbImage,
                youTubeAdVideos,
                brandName,
                brandImage,
                productInstallers,
                productInstallationAvailability,
                productInstallationServiceCost,
                installationServiceCostType,
            } = decryptedData


            productAlreadyExists = false

            if (!productAlreadyExists) {

                // check product code from existing count
                // update count after the request for create is successful

                let productId

                await NewCount.findOne(
                    {
                        selectMe: "selectMe",
                    }
                )
                    .then(result => {
                        // categoryCount = result.categoryCount
                        // subCategoryCount = result.subCategoryCount
                        // productTypeCount = result.productTypeCount
                        productCount = result.productCount
                    })
                    .catch(e => h.response(e))

                productId = productTypeId + "-P" + unitsPlaceConverter(productCount)

                const getCategoryId = () => {
                    const categoryId = productId.split("-")
                    return categoryId[0].toUpperCase()
                }

                const getSubCategoryId = () => {
                    const categoryId = productId.split("-")
                    return categoryId[0].toUpperCase() + "-" + categoryId[1].toUpperCase()
                }

                const categoryId = getCategoryId()
                const subCategoryId = getSubCategoryId()

                let categoryName = CategoryNames[categoryId]
                let productTypes = []
                let subCategoryName,
                    productUploadCountIncrementAndSubCategoryNameData = {},
                    updateInCategoriesAndUpdateInVendorsData = {}


                await Promise.all([
                    NewProduct.create(
                        {
                            rLId,
                            productId,
                            productName,
                            product_lowerCased_name: productName.toLowerCase(),
                            productCode,
                            basePrice,
                            priceNotation,
                            gstPercentage,
                            productMaterials,
                            finishingOptions,
                            colorOptions,
                            sizesAvailable,
                            minQuantity,
                            maxQuantity,
                            productDescription,
                            features,
                            designStyles,
                            tags,
                            availability,
                            productRating,
                            discount,
                            productImages,
                            productThumbImage,
                            productRating: 0,
                            youTubeAdVideos,
                            brandName,
                            brandImage,
                            productInstallers,
                            productInstallationAvailability,
                            productInstallationServiceCost,
                            installationServiceCostType,
                        }
                    ),

                    NewCount.findOneAndUpdate(
                        {
                            selectMe: "selectMe",
                        },
                        {
                            $inc: {
                                productCount: 1
                            }
                        },
                        {
                            new: true
                        }
                    ),

                    NewCategory[categoryName].findOne(
                        {
                            subCategoryId
                        }
                    ),

                    NewEmptyCategories.findOne(
                        {
                            categoryWholeData: "all-cats-sCats-pTypes-incl-pCount"
                        }
                    )

                ])

                    .then((resultArray) => {
                        productUploadCountIncrementAndSubCategoryNameData = resultArray.reduce(
                            (all, item) => {
                                all = {
                                    ...all,
                                    ...item._doc
                                }

                                return all
                            },
                            {}
                        )


                    })
                    .catch((err) => {
                        console.log(err)
                        return h.response(err)
                    })


                let { allCategories } = productUploadCountIncrementAndSubCategoryNameData

                let testUnique

                const incProdCountInNavBarAllCategoriesData = () => {
                    return allCategories.map(cat => {
                        cat.subCategories.map(sCat => {
                            sCat.productTypes.map(pType => {
                                if (pType.productTypeId === productTypeId) {
                                    testUnique = productTypeId
                                    pType.productsCount++
                                }

                                return pType
                            })
                            return sCat
                        })
                        return cat
                    })
                }

                let newCategoryData = incProdCountInNavBarAllCategoriesData()
                productId = productUploadCountIncrementAndSubCategoryNameData.productId

                dataToSendBack = {
                    responseData: DataEncrypterAndDecrypter.encryptData({ nice: "nice" }),
                    message: "Product created successfully and " + "incremented product type count to " + productUploadCountIncrementAndSubCategoryNameData.productCount
                }

                productTypes = productUploadCountIncrementAndSubCategoryNameData.productTypes
                subCategoryName = productUploadCountIncrementAndSubCategoryNameData.subCategoryName

                productTypes = productTypes.map((item, i) => {
                    if (item.productTypeId === productTypeId) {
                        item.products.push({
                            productId: productId,
                            thumb: productThumbImage,
                            subCategoryName,
                            productName
                        })
                    }

                    return item
                })


                await Promise.all([
                    NewCategory[categoryName].findOneAndUpdate(
                        {
                            subCategoryId
                        },
                        {
                            productTypes
                        }
                    ),

                    NewVendor.findOneAndUpdate(
                        {
                            rLId
                        },
                        {
                            $push: {
                                products: {
                                    productId: productId,
                                    thumb: productThumbImage,
                                    subCategoryName,
                                    productName
                                }
                            }
                        },
                        {
                            new: true
                        }
                    ),

                    NewEmptyCategories.findOneAndUpdate(
                        {
                            categoryWholeData: "all-cats-sCats-pTypes-incl-pCount"
                        },
                        {
                            allCategories: [...newCategoryData]
                        },
                        {
                            new: true
                        }
                    )
                ])


                    .then((resultArray) => {
                        updateInCategoriesAndUpdateInVendorsData = resultArray.reduce(
                            (all, item, i) => {
                                all = {
                                    ...all,
                                    ...item._doc
                                }

                                return all
                            },
                            {}
                        )
                    })
                    .catch((err) => {
                        console.log(err)
                        return h.response(err)
                    })

                dataToSendBack = {
                    ...dataToSendBack,
                    anotherMessage: "Added to sub-category " + updateInCategoriesAndUpdateInVendorsData.subCategoryName + "and to " + updateInCategoriesAndUpdateInVendorsData.companyName
                }

            }
        }

        else {
            dataToSendBack = {
                message: "Wrong data"
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

let getProductData = {
    method: "POST",
    path: "/api/categories/get-product-data",

    config: {
        cors: corsHeaders,
        auth: {
            strategy: 'restricted',
        },
        tags: ['api'],
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
            productId: Joi.string().max(80).required(),
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

        const { rLId } = request.auth.credentials

        let dataToSendBack, productFound = false

        if (dataPassesValidation === true) {

            let { productId } = decryptedData

            await NewProduct.findOne({
                productId
            })
                .then((result) => {
                    if (result) {
                        productFound = true
                        dataToSendBack = result

                        // 
                        // Encrypt data
                        // 
                        dataToSendBack = {
                            responseData: DataEncrypterAndDecrypter.encryptData(dataToSendBack),
                            message: "Product found"
                        }
                        // 
                        // Encrypt data
                        // 
                    }

                    else {
                        dataToSendBack = {
                            productFound: false
                        }
                    }
                })
                .catch(e => {
                    console.error(e)
                    return h.response(e)
                })


        }

        else {
            dataToSendBack = {
                message: "Wrong data"
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

let getProductDataNoAuth = {
    method: "POST",
    path: "/api/categories/get-product-data-no-auth",

    config: {
        cors: corsHeaders,
        auth: {
            strategy: 'restricted',
            mode: 'try'
        },
        tags: ['api'],
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
        /////// VALIDATE PAYLOAD //////////////////////////////////////
        let dataPassesValidation = false

        const schema = Joi.object().keys({
            productId: Joi.string().max(80).required(),
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
        /////// VALIDATE PAYLOAD //////////////////////////////////////


        // const { rLId } = request.auth.credentials

        let dataToSendBack, productFound = false

        if (dataPassesValidation === true) {

            let { productId } = decryptedData

            await NewProduct.findOne({
                productId
            })
                .then((result) => {
                    if (result) {
                        productFound = true
                        dataToSendBack = result

                        // 
                        // Encrypt data
                        // 
                        dataToSendBack = {
                            responseData: DataEncrypterAndDecrypter.encryptData(dataToSendBack),
                            message: "Product found"
                        }
                        // 
                        // Encrypt data
                        // 
                    }

                    else {
                        dataToSendBack = {
                            productFound: false
                        }
                    }
                })
                .catch(e => {
                    console.error(e)
                    return h.response(e)
                })


        }

        else {
            dataToSendBack = {
                message: "Wrong data"
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

let getProductsDataOfQuery = {
    method: "GET",
    path: "/api/products/get-products-data-of-query",

    config: {
        cors: corsHeaders,
        auth: {
            strategy: 'restricted',
            mode: 'try'
        },
        tags: ['api']
    },

    handler: async (request, h) => {
        let dataToSendBack, responseData;

        const { searchForProduct } = request.query;

        await NewProduct.find({ 
            product_lowerCased_name: {
                    $regex: new RegExp(searchForProduct)
                } 
            })
            .limit(5)
            .then(res => {
                responseData = res
            })
            .catch(err => console.log(err))

        dataToSendBack = {
            queriedProductsData: responseData
        }

        // 
        // Encrypt data
        // 
        dataToSendBack = {
            responseData: DataEncrypterAndDecrypter.encryptData(dataToSendBack),
            message: "Sending top 25 products related to query parameter"
        }
        // 
        // Encrypt data
        // 

        return h.response(dataToSendBack);
    }
}

let updateProductData = {
    method: "PUT",
    path: "/api/categories/update-product-data",

    config: {
        cors: corsHeaders,
        auth: {
            strategy: 'restricted',
        },
        tags: ['api'],
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

            productName: Joi.string().max(60).required(), // verified frontend
            productCode: Joi.string().max(30).required(), // verified frontend
            basePrice: Joi.number().integer().max(99999999).required().allow(null), // verified frontend
            priceNotation: Joi.number().max(30).required(),
            gstPercentage: Joi.number().max(100).required(), // verified frontend
            productMaterials: Joi.array().items(
                Joi.object().keys({
                    materialCost: Joi.number().integer().max(99999999).required(), // verified frontend
                    materialName: Joi.string().max(60).required(), // verified frontend
                    materialGrade: Joi.string().max(30).allow(null, ""), // verified frontend
                })
            ).required(), // verified frontend
            finishingOptions: Joi.array().items(
                Joi.object().keys({
                    finishName: Joi.string().max(30).required(), // verified frontend
                    finishCode: Joi.string().max(30).allow(null, ""), // verified frontend
                    finishImage: Joi.string().required(), // verified frontend
                    finishCost: Joi.number().max(99999999)  // verified frontend
                })
            ).required(), // verified frontend
            colorOptions: Joi.array().items(
                Joi.object().keys({
                    colorName: Joi.string().max(30).required(), // verified frontend
                    colorCode: Joi.string().max(7).required(), // verified frontend
                    colorCost: Joi.number().max(99999999) // verified frontend
                })
            ).required(), // verified frontend
            sizesAvailable: Joi.array().items(
                Joi.object().keys({
                    sizeName: Joi.string().max(100), // verified frontend
                    sizeCost: Joi.number().max(99999999) // verified frontend
                })
            ), // verified frontend
            minQuantity: Joi.number().max(99999999).required(), // verified frontend
            maxQuantity: Joi.number().max(99999999).required(), // verified frontend
            productDescription: Joi.string().max(500).required(), // verified frontend
            features: Joi.array().items(
                Joi.string().max(200).allow(null, ""), // verified frontend
            ),
            designStyles: Joi.array().items(
                Joi.object().keys({
                    styleId: Joi.number(), // verified frontend
                    styleName: Joi.string().max(30).required() // verified frontend
                })
            ).required(), // verified frontend
            productId: Joi.string().max(80).required(),
            // productTypeId : Joi.string().max(21).required(), // verified frontend
            tags: Joi.array().items(
                Joi.string().max(40) // verified frontend
            ).required(), // verified frontend
            availability: Joi.boolean().required(), // verified frontend
            // productRating : Joi.number().max(5),
            discount: Joi.number().max(100).required(), // verified frontend
            productImages: Joi.array().items(
                Joi.object().keys({
                    itemCode: Joi.string().max(100).allow(null, "").required(), // verified frontend
                    textOnRibbonSatisfied: Joi.boolean().required(), // verified frontend
                    imageURL: Joi.string().max(2048).required() // verified frontend
                })
            ).required(), // verified frontend
            productThumbImage: Joi.string().max(2048).required(), // verified frontend
            brandName: Joi.string().max(30).allow(null, ""),
            brandImage: Joi.string().max(2048).allow(null, ""),
            youTubeAdVideos: Joi.array().items(
                Joi.string()
            ),

            productInstallers: Joi.array().items(
                Joi.object().keys({
                    installerName: Joi.string().max(30),
                    installerContactNo: Joi.number().max(9999999999),
                    installerCharges: Joi.number().max(99999),
                    installerChargeType: Joi.number().max(10),
                })
            ),
            productInstallationAvailability: Joi.number().max(10),
            productInstallationServiceCost: Joi.number().max(99999),
            installationServiceCostType: Joi.number().max(10)

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

        const { rLId } = request.auth.credentials

        let dataToSendBack, productFound = false



        if (dataPassesValidation === true) {

            let productAlreadyExists = false
            let {
                productId,
                productName,
                productCode,
                basePrice,
                priceNotation,
                gstPercentage,
                productMaterials,
                finishingOptions,
                colorOptions,
                sizesAvailable,
                minQuantity,
                maxQuantity,
                productDescription,
                features,
                designStyles,
                tags,
                availability,
                productRating,
                discount,
                productImages,
                productThumbImage,
                youTubeAdVideos,
                brandName,
                brandImage,
                productInstallers,
                productInstallationAvailability,
                productInstallationServiceCost,
                installationServiceCostType,
            } = decryptedData



            await NewProduct.findOneAndUpdate(
                {
                    productId
                },
                {
                    productName,
                    product_lowerCased_name: productName.toLowerCase(),
                    productCode,
                    basePrice,
                    priceNotation,
                    gstPercentage,
                    productMaterials, // array
                    finishingOptions, // array
                    colorOptions, // array
                    sizesAvailable, // array
                    minQuantity,
                    maxQuantity,
                    productDescription,
                    features, // array
                    designStyles, // array
                    tags, // array
                    availability,
                    productRating,
                    discount,
                    productImages, // array
                    productThumbImage,
                    youTubeAdVideos, // array
                    brandName,
                    brandImage,
                    productInstallers,
                    productInstallationAvailability,
                    productInstallationServiceCost,
                    installationServiceCostType,
                },
                {
                    new: true
                }
            )
                .then((result) => {
                    if (result) {
                        productFound = true
                        dataToSendBack = result

                        // 
                        // Encrypt data
                        // 
                        dataToSendBack = {
                            responseData: DataEncrypterAndDecrypter.encryptData(dataToSendBack),
                            message: "Product found"
                        }
                        // 
                        // Encrypt data
                        // 
                    }

                    else {
                        dataToSendBack = {
                            productFound: false
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
                })
                .catch(e => {
                    console.error(e)
                    return h.response(e)
                })



            if (productFound) {
                const getCategoryId = () => {
                    const categoryId = productId.split("-")
                    return categoryId[0].toUpperCase()
                }

                const getSubCategoryId = () => {
                    const subCategoryId = productId.split("-")
                    return subCategoryId[0].toUpperCase() + "-" + subCategoryId[1].toUpperCase()
                }

                const getProductTypeId = () => {
                    const productTypeId = productId.split("-")
                    return productTypeId[0].toUpperCase() + "-" + productTypeId[1].toUpperCase() + "-" + productTypeId[2].toUpperCase()
                }

                const categoryId = getCategoryId()
                const subCategoryId = getSubCategoryId()
                const productTypeId = getProductTypeId()

                let categoryName = CategoryNames[categoryId]
                let productTypes = []
                let subCategoryName

                await NewCategory[categoryName].findOne(
                    {
                        subCategoryId
                    }
                )
                    .then(result => {
                        productTypes = result.productTypes
                        subCategoryName = result.subCategoryName
                    })
                    .catch(e => h.response(e))

                productTypes = productTypes.map((item, i) => {
                    if (item.productTypeId === productTypeId) {

                        // let productExists = false
                        item.products = item.products.map((product, k) => {
                            if (product.productId === productId) {
                                // productExists = true
                                return (
                                    {
                                        productId: productId,
                                        thumb: productThumbImage,
                                        subCategoryName,
                                        productName
                                    }
                                )
                            }

                            else {
                                return product
                            }
                        })
                    }

                    return item
                })



                await NewCategory[categoryName].findOneAndUpdate(
                    {
                        subCategoryId
                    },
                    {
                        productTypes
                    }
                )
                    .then(result => {
                        dataToSendBack = {
                            ...dataToSendBack,
                            anotherExtraMessage: "Added to sub-category " + subCategoryId
                        }
                    })
                    .catch(e => {
                        console.error(e)
                        return h.response(e)
                    })


                await NewVendor.findOneAndUpdate(
                    {
                        rLId,
                        "products.productId": productId
                    },
                    {
                        $set: {
                            "products.$.thumb": productThumbImage,
                            "products.$.productName": productName,
                        }
                    },
                    {
                        new: true
                    }
                )
                    .then((result) => {
                        dataToSendBack = {
                            ...dataToSendBack,
                            lastMessage: "Added to " + result.companyName
                        }
                    })
                    .catch(e => {
                        console.error(e)
                        return h.response(e)
                    })




            }












        }

        else {
            dataToSendBack = {
                message: "Wrong data"
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


let deleteProductData = {
    method: "DELETE",
    path: `/api/categories/delete-product`,

    config: {
        cors: corsHeaders,
        auth: {
            strategy: 'restricted',
        },
        tags: ['api'],
        // validate: {
        //     payload: {
        //         message: Joi.string(),
        //         requestData: Joi.string(),
        //     }
        // }
    },

    handler: async (request, h) => {

        // let { requestData, message } = request.payload

        let productId = request.query.pId




        /////// VALIDATE PAYLOAD //////////////////////////////////////
        let dataPassesValidation = false



        const schema = Joi.string().max(80).required()

        await Joi.validate(productId, schema)
            .then((val) => {
                dataPassesValidation = true
            })
            .catch(e => {
                console.error(e)
                return h.response(e)
            })
        /////// VALIDATE PAYLOAD //////////////////////////////////////

        const { rLId } = request.auth.credentials

        let dataToSendBack, productFound = false

        if (dataPassesValidation === true) {

            // let { productId } = decryptedData


            // console.log(productId)

            await NewProduct.findOneAndDelete(
                {
                    productId
                },

                // {
                //     remove : true 
                // }
            )
                .then((result) => {
                    if (result) {
                        productFound = true
                        dataToSendBack = result

                        // 
                        // Encrypt data
                        // 
                        dataToSendBack = {
                            responseData: DataEncrypterAndDecrypter.encryptData(dataToSendBack),
                            message: "Product found"
                        }
                        // 
                        // Encrypt data
                        // 
                    }

                    else {
                        dataToSendBack = {
                            productFound: false
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
                })
                .catch(e => {
                    console.error(e)
                    return h.response(e)
                })



            if (productFound) {
                const getCategoryId = () => {
                    const categoryId = productId.split("-")
                    return categoryId[0].toUpperCase()
                }

                const getSubCategoryId = () => {
                    const subCategoryId = productId.split("-")
                    return subCategoryId[0].toUpperCase() + "-" + subCategoryId[1].toUpperCase()
                }

                const getProductTypeId = () => {
                    const productTypeId = productId.split("-")
                    return productTypeId[0].toUpperCase() + "-" + productTypeId[1].toUpperCase() + "-" + productTypeId[2].toUpperCase()
                }

                const categoryId = getCategoryId()
                const subCategoryId = getSubCategoryId()
                const productTypeId = getProductTypeId()

                let categoryName = CategoryNames[categoryId]
                let productTypes = []
                let subCategoryName

                await NewCategory[categoryName].findOne(
                    {
                        subCategoryId
                    }
                )
                    .then(result => {
                        productTypes = result.productTypes
                        subCategoryName = result.subCategoryName
                    })
                    .catch(e => h.response(e))

                productTypes = productTypes.map((item, i) => {
                    if (item.productTypeId === productTypeId) {

                        // let productExists = false
                        item.products = item.products.map((product, k) => {
                            if (product.productId === productId) {
                                // productExists = true
                                // return (
                                //     {
                                //         productId : productId,
                                //         thumb : productThumbImage,
                                //         subCategoryName,
                                //         productName
                                //     }
                                // )
                                return null
                            }

                            else {
                                return product
                            }
                        })

                        item.products = item.products.filter(function (el) {
                            return el !== null
                        })
                    }

                    return item
                })



                await NewCategory[categoryName].findOneAndUpdate(
                    {
                        subCategoryId
                    },
                    {
                        productTypes
                    }
                )
                    .then(result => {
                        dataToSendBack = {
                            ...dataToSendBack,
                            anotherExtraMessage: "Removed from sub-category " + subCategoryId
                        }
                    })
                    .catch(e => {
                        console.error(e)
                        return h.response(e)
                    })


                await NewVendor.findOneAndUpdate(
                    {
                        rLId,
                        "products.productId": productId
                    },
                    {
                        $pull: {
                            products: {
                                "productId": productId,
                            }
                            // "products.$.productId" : productId,
                            // "products.$.thumb" : productThumbImage,
                            // "products.$.productName" : productName,
                            // "products.$.subCategoryName" : subCategoryName
                        }
                    },
                    {
                        new: true
                    }
                )
                    .then((result) => {
                        dataToSendBack = {
                            ...dataToSendBack,
                            lastMessage: "Deleted from " + result.companyName
                        }
                    })
                    .catch(e => {
                        console.error(e)
                        return h.response(e)
                    })


                // UPDATES NAVBAR DATA //
                ///////////////////////////////
                let newNavBarData = []

                await NewEmptyCategories.findOne(
                    {
                        categoryWholeData: "all-cats-sCats-pTypes-incl-pCount"
                    }
                )
                    .then(result => {
                        let { allCategories } = result

                        const addSubcategoryData = () => {
                            return allCategories.map(cat => {
                                cat.subCategories.map(sCat => {
                                    sCat.productTypes.map(pType => {
                                        if (pType.productTypeId === productTypeId) {
                                            pType.productsCount--
                                        }
                                        return pType
                                    })
                                    return sCat
                                })
                                return cat
                            })
                        }

                        newNavBarData = addSubcategoryData()
                    })
                    .catch(e => h.response(e))


                await NewEmptyCategories.findOneAndUpdate(
                    {
                        categoryWholeData: "all-cats-sCats-pTypes-incl-pCount"
                    },
                    {
                        allCategories: [...newNavBarData]
                    },
                    {
                        new: true
                    }
                )
                    .then(result => {

                        dataToSendBack = {
                            ...dataToSendBack,
                            lastMessage: "Added to Navbar data too"
                        }

                        // if(result){
                        //     productTypeAlreadyExists = true
                        // }

                        // else{
                        //     productTypeAlreadyExists = false
                        // }
                    })
                    .catch(e => h.response(e))

                // UPDATES NAVBAR DATA //




            }




























        }

        else {
            dataToSendBack = {
                message: "Wrong data"
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


let ProductsRoute = [
    addNewProduct,
    getProductData,
    updateProductData,
    deleteProductData,
    getProductDataNoAuth,
    getProductsDataOfQuery
]

module.exports = ProductsRoute


