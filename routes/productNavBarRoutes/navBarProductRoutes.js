"use strict"

// External dependencies
const Joi = require("joi")
const Bcrypt = require("bcryptjs")

const NewCategory = require("../../models/newCategories")
const NewProduct = require("../../models/newProducts")

const CategoryNames = require("../../lib/categoryNames")

const NewEmptyCategories = require("../../models/newEmptyCategories")

const DataEncrypterAndDecrypter = require("../../factories/encryptDecrypt")

const corsHeaders = require("../../lib/routeHeaders")

const unitsPlaceConverter = theNumber => {
    if (theNumber < 10) {
        return "000" + theNumber
    } else if (theNumber >= 10 && theNumber < 100) {
        return "00" + theNumber
    } else if (theNumber >= 100 && theNumber < 1000) {
        return "0" + theNumber
    } else {
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

// //////////////////////////////////////////////////////////////
// // GET PRODUCTS DATA LIVE COUNT //////
// let getAllProductsCategories = {
//     method: "GET",
//     path: "/api/categories/get-all-products-data",

//     config: {
//         cors: corsHeaders,
//         auth: {
//             strategy: 'restricted',
//             mode: 'try'
//         },
//         tags: ['api'],
//     },
//     handler: async (request, h) => {

//         let dataToSendBack,
//             categoriesArray = [],
//             categoriesToSend = [],
//             dummyArray = []

//         for (let index = 0; index <= 32; index++) {
//             categoriesArray.push( CategoryNames["CAT" + unitsPlaceConverter(index)] )
//             categoriesToSend.push(
//                 {
//                     categoryName: CategoryNames["CAT" + unitsPlaceConverter(index)],
//                     categoryId:  "CAT" + unitsPlaceConverter(index),
//                     subCategories: []
//                 }
//             )
//         }

//         const returnFindFunctionsArray = () => {

//             let mongoFindFunctionsArray = []
//             categoriesArray.map(category => {
//                 mongoFindFunctionsArray.push(
//                     NewCategory[category].find()
//                 )
//             })

//             return mongoFindFunctionsArray
//         }

//         await Promise.all(returnFindFunctionsArray())
//         .then(async (result) => {

//             await result.map((subCategory, j) => {
//                 dummyArray = [
//                     ...dummyArray,
//                     ...subCategory,
//                 ]
//             })

//             dummyArray.map((item, k) => {
//                 let catId = item.subCategoryId.split("-")[0]

//                 categoriesToSend.map((catCheck, k) => {
//                     if(catId.toLowerCase() === catCheck.categoryId.toLowerCase()){

//                         let tempProductTypesArray = []

//                         item.productTypes.map((productType, l) => {
//                             tempProductTypesArray.push({
//                                 productTypeName : productType.productType,
//                                 productTypeId : productType.productTypeId,
//                                 productsCount : productType.products.length
//                             })
//                         })

//                         catCheck.subCategories.push(
//                             {
//                                 subCategoryName : item.subCategoryName,
//                                 subCategoryId: item.subCategoryId,
//                                 productTypes : [...tempProductTypesArray]
//                             }
//                         )
//                     }
//                 })
//             })

//         })
//         .catch(e => {
//             console.error(e)
//             return h.response(e)
//         })

//         ///////////////////////////////////////////////////////////////////////////
//         ///////////////////////////////////////////////////////////////////////////
//         ///////////////////////////////////////////////////////////////////////////
//         ///////    console.log(categoriesToSend)                            ///////
//         ///////    await NewEmptyCategories.create(                         ///////
//         ///////        {                                                    ///////
//         ///////            allCategories : [...categoriesToSend]            ///////
//         ///////        }                                                    ///////
//         ///////    )                                                        ///////
//         ///////    .then(() => {                                            ///////
//         ///////        console.log("done")                                  ///////
//         ///////    })                                                       ///////
//         ///////    .catch(() => {})                                         ///////
//         ///////////////////////////////////////////////////////////////////////////
//         ///////////////////////////////////////////////////////////////////////////
//         ///////////////////////////////////////////////////////////////////////////

//         //
//         // Encrypt data
//         //
//         dataToSendBack = {
//             responseData: DataEncrypterAndDecrypter.encryptData({
//                 allCategories : [...categoriesToSend]
//             }),
//             message: "Alpha niner 45, dispatching all categories. Brace for impact."
//         }
//         //
//         // Encrypt data
//         //

//         return h.response(dataToSendBack)
//     }
// }
// // GET PRODUCTS DATA LIVE COUNT //////

let getAllProductsCategories = {
    method: "GET",
    path: "/api/categories/get-all-products-data",

    config: {
        cors: corsHeaders,
        auth: {
            strategy: "restricted",
            mode: "try",
        },
        tags: ["api"],
    },
    handler: async (request, h) => {
        let dataToSendBack,
            categoriesArray = [],
            categoriesToSend = [],
            dummyArray = []

        await NewEmptyCategories.findOne({
            categoryWholeData: "all-cats-sCats-pTypes-incl-pCount",
        })
            .then(result => {
                categoriesToSend = [...result.allCategories]
            })
            .catch(e => {
                console.error(e)
                return h.response(e)
            })

        ///////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////
        ///////    console.log(categoriesToSend)                            ///////
        ///////    await NewEmptyCategories.create(                         ///////
        ///////        {                                                    ///////
        ///////            allCategories : [...categoriesToSend]            ///////
        ///////        }                                                    ///////
        ///////    )                                                        ///////
        ///////    .then(() => {                                            ///////
        ///////        console.log("done")                                  ///////
        ///////    })                                                       ///////
        ///////    .catch(() => {})                                         ///////
        ///////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////

        //
        // Encrypt data
        //
        dataToSendBack = {
            responseData: DataEncrypterAndDecrypter.encryptData({
                allCategories: [...categoriesToSend],
            }),
            message:
                "Alpha niner 45, dispatching all categories. Brace for impact.",
        }
        //
        // Encrypt data
        //

        return h.response(dataToSendBack)
    },
}

let getFiveProductsCategories = {
    method: "POST",
    path: "/api/categories/get-five-products-data",

    config: {
        cors: corsHeaders,
        auth: {
            strategy: "restricted",
            mode: "try",
        },
        tags: ["api"],
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
            categoryId: Joi.string().max(8).required(), // verified frontend
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

        let dataToSendBack = {},
            categoriesArray = [],
            categoriesToSend = [],
            dummyArray = []

        if (dataPassesValidation === true) {
            let { categoryId } = decryptedData
            // for (let index = 0; index <= 32; index++) {
            //     categoriesArray.push( CategoryNames["CAT" + unitsPlaceConverter(index)] )
            //     categoriesToSend.push(
            //         {
            //             categoryName: CategoryNames["CAT" + unitsPlaceConverter(index)],
            //             categoryId:  "CAT" + unitsPlaceConverter(index),
            //             subCategories: []
            //         }
            //     )
            // }

            // await NewCategory[CategoryNames[categoryId.toUpperCase()]].find()

            await NewEmptyCategories.findOne({
                categoryWholeData: "all-cats-sCats-pTypes-incl-pCount",
            })
                // await Promise.all(returnFindFunctionsArray())
                .then(result => {
                    let { allCategories } = result

                    allCategories.map(cat => {
                        if (cat.categoryId === categoryId)
                            dummyArray = [...cat.subCategories]
                    })

                    dummyArray = dummyArray.map(subCat => {
                        subCat.productTypes.map(pType => {
                            pType["productType"] = pType.productTypeName
                            return pType
                        })
                        return subCat
                    })

                    dataToSendBack["subCategories"] = [...dummyArray]
                })
                .catch(e => {
                    console.error(e)
                    return h.response(e)
                })
            // console.log(dataToSendBack)
            //
            // Encrypt data
            //
            dataToSendBack = {
                responseData:
                    DataEncrypterAndDecrypter.encryptData(dataToSendBack),
                message:
                    "Alpha niner 45, dispatching all categories with 5 products. Brace for impact.",
            }
            //
            // Encrypt data
            //
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

let getTenMoreProducts = {
    method: "POST",
    path: "/api/categories/get-ten-more-products",

    config: {
        cors: corsHeaders,
        auth: {
            strategy: "restricted",
            mode: "try",
        },
        tags: ["api"],
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
            fetchId: Joi.string().max(30).required(), // verified frontend
            productSetNumber: Joi.number().required(),
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

        let dataToSendBack,
            categoriesArray = [],
            categoriesToSend = [],
            dummyArray = []

        if (dataPassesValidation === true) {
            let { fetchId, productSetNumber } = decryptedData

            let categoryId = fetchId.split("-")[0]

            // for (let index = 0; index <= 32; index++) {
            //     categoriesArray.push( CategoryNames["CAT" + unitsPlaceConverter(index)] )
            //     categoriesToSend.push(
            //         {
            //             categoryName: CategoryNames["CAT" + unitsPlaceConverter(index)],
            //             categoryId:  "CAT" + unitsPlaceConverter(index),
            //             subCategories: []
            //         }
            //     )
            // }

            //////////////////// NEW ROUTE ///////////////////////

            let lengthFetchId = fetchId.length,
                productsArray = [],
                subCatObj
            let fetchIdToQuery =
                fetchId.split("-")[0] + "-" + fetchId.split("-")[1]

            await Promise.all([
                await NewProduct.find({
                    productId: {
                        $regex: fetchIdToQuery,
                    },
                }),
                await NewCategory[
                    CategoryNames[categoryId.toUpperCase()]
                ].findOne({
                    // productTypes : {
                    //     $elemMatch : {
                    //         productTypeId : productTypeId
                    //     }
                    // }
                    subCategoryId:
                        fetchId.split("-")[0] + "-" + fetchId.split("-")[1],
                }),
            ])

                .then(res => {
                    productsArray = [...res]
                    // console.log(res)

                    productsArray = [...res].filter(item =>
                        Array.isArray(item)
                    )[0]
                    subCatObj = [...res].filter(item => !Array.isArray(item))[0]
                })
                .catch(e => {
                    console.error(e)
                    return h.response(e)
                })

            // console.log(subCatObj)

            productsArray = productsArray.sort((a, b) =>
                a.productId.localeCompare(b.productId)
            )

            // console.log(productsArray)

            if (lengthFetchId > 14) {
                dataToSendBack = productsArray.filter((product, i) => {
                    let pTypeId =
                        product.productId.split("-")[0] +
                        "-" +
                        product.productId.split("-")[1] +
                        "-" +
                        product.productId.split("-")[2]
                    return pTypeId === fetchId
                })
            } else {
                dataToSendBack = productsArray.filter((product, i) => {
                    let pTypeId =
                        product.productId.split("-")[0] +
                        "-" +
                        product.productId.split("-")[1] +
                        "-" +
                        product.productId.split("-")[2]
                    return pTypeId === subCatObj.productTypes[0].productTypeId
                })
            }

            dataToSendBack = {
                setOf10Products: dataToSendBack.slice(
                    productSetNumber,
                    productSetNumber + 9
                ),
            }

            //////////////////// NEW ROUTE ///////////////////////

            // await NewCategory[CategoryNames[categoryId.toUpperCase()]]
            // .findOne({
            //     // productTypes : {
            //     //     $elemMatch : {
            //     //         productTypeId : productTypeId
            //     //     }
            //     // }
            //     subCategoryId : fetchId.split("-")[0] + "-" + fetchId.split("-")[1]
            // })

            // .then(async (result) => {

            //     // console.log(result.productTypes)
            //     let lengthFetchId = fetchId.length

            //     if(lengthFetchId > 14){
            //         dataToSendBack = result.productTypes.filter((productType, l) => {
            //             return productType.productTypeId === fetchId
            //             // productType.products = productType.products.slice(productSetNumber, 10)
            //             // return productType
            //         })
            //     }

            //     else{
            //         dataToSendBack = result.productTypes.filter((productType, l) => {
            //             return l === 0
            //             // productType.products = productType.products.slice(productSetNumber, 10)
            //             // return productType
            //         })
            //     }

            //     dataToSendBack = {
            //         setOf10Products : dataToSendBack[0].products.slice(productSetNumber, productSetNumber + 9)
            //     }

            //     // // dummyArray.map((item, k) => {

            //     // // })

            //     // dataToSendBack = {}

            //     // dataToSendBack = dummyObj

            // })
            // .catch(e => {
            //     console.error(e)
            //     return h.response(e)
            // })

            //
            // Encrypt data
            //
            dataToSendBack = {
                responseData:
                    DataEncrypterAndDecrypter.encryptData(dataToSendBack),
                message:
                    "Alpha niner 45, dispatching all categories with 10 products. Brace for impact.",
            }
            //
            // Encrypt data
            //
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

let navBarProductsRoute = [
    getAllProductsCategories,
    getFiveProductsCategories,
    getTenMoreProducts,
]

module.exports = navBarProductsRoute
