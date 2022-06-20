"use strict"

// External dependencies
const Joi = require("joi")
const Bcrypt = require("bcryptjs")

const NewCategory = require("../../models/newCategories")
const NewEmptyCategories = require("../../models/newEmptyCategories")
const CategoryCodes = require("../../lib/categoryCodes")
const NewCount = require("../../models/newCount")

const corsHeaders = require("../../lib/routeHeaders")

let categoryCount = 32,
    subCategoryCount = 84,
    productTypeCount = 873

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

var fs = require("fs")

let convertCategories = {
    method: "GET",
    path: "/api/conversions/category",

    config: {
        cors: corsHeaders,
        auth: {
            strategy: "restricted",
            mode: "try",
        },
        tags: ["api"],
    },
    handler: async (request, h) => {
        let dataToSendBack

        // const { name } = request.payload

        const theData = fs.readFile(
            __dirname + "/wood.json",
            "utf-8",
            (err, res) => {
                let data = JSON.parse(res)

                const subCategoryNamesObject = data[0]
                let subCategoryNames = []

                for (let key in subCategoryNamesObject) {
                    if (subCategoryNamesObject.hasOwnProperty(key)) {
                        subCategoryNames.push({
                            subCategoryName: subCategoryNamesObject[key].trim(),
                            subCategoryId:
                                "CAT" +
                                unitsPlaceConverter(categoryCount) +
                                "-" +
                                "SC" +
                                unitsPlaceConverter(subCategoryCount),
                            productTypes: [],
                        })
                        subCategoryCount++
                    }
                }

                data.map((item, i) => {
                    let count = 0

                    for (var key in item) {
                        if (item.hasOwnProperty(key)) {
                            if (
                                item[key] !== "" &&
                                item[key] !==
                                    subCategoryNames[count].subCategoryName
                            ) {
                                subCategoryNames[count].productTypes.push({
                                    productType: item[key].trim(),
                                    productTypeId: "",
                                    products: [],
                                })
                            }
                        }

                        count++
                    }
                })

                const giveProductTypeIds = () => {
                    subCategoryNames.map((item, i) => {
                        item.productTypes.map((productType, j) => {
                            productType.productTypeId =
                                item.subCategoryId +
                                "-" +
                                "PT" +
                                unitsPlaceConverter(productTypeCount)
                            productTypeCount++
                        })
                    })
                }

                giveProductTypeIds()

                fs.writeFile(
                    __dirname + "/categoryRefined.json",
                    JSON.stringify(subCategoryNames, null, 2),
                    e => {
                        console.log("done")
                    }
                )
            }
        )

        return h.response(dataToSendBack)
    },
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

let newSubcategory = {
    method: "POST",
    path: "/api/categories/new-category",

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
            adminPasscode,
            categoryCount,
            subCategoryCount,
            productTypeCount,
            productCount

        const {
            subCategoryName,
            adminId,
            adminPassword,
            categoryName,
            categoryId,
        } = request.payload

        if (adminId === "PRAVAS") {
            adminPasscode = "XXR_@931810@_PXX"
        }

        if (adminId === "HARSH") {
            adminPasscode = "XXN_@891509@_HXX"
        }

        if (adminId === "TIPPU") {
            adminPasscode = "XXN_@922908@_TXX"
        }

        if (adminPasscode === adminPassword) {
            const uploadNewSubCategory = async (
                categoryNameParam,
                categoryIdParam
            ) => {
                // console.log(categoryIdParam, CategoryCodes[categoryNameParam])
                if (categoryIdParam === CategoryCodes[categoryNameParam]) {
                    let productTypeAlreadyExists = true

                    await NewCount.findOne({
                        selectMe: "selectMe",
                    })
                        .then(result => {
                            categoryCount = result.categoryCount
                            subCategoryCount = result.subCategoryCount
                            productTypeCount = result.productTypeCount
                            productCount = result.productCount
                        })
                        .catch(e => h.response(e))

                    // check if subCategory exists
                    await NewCategory[categoryNameParam]
                        .findOne({
                            subCategoryName,
                        })
                        .then(result => {
                            if (result) {
                                productTypeAlreadyExists = true
                            } else {
                                productTypeAlreadyExists = false
                            }
                        })
                        .catch(e => h.response(e))

                    if (productTypeAlreadyExists) {
                        dataToSendBack = {
                            message:
                                "Sorry, couldn't add the new sub-category because it was already added.",
                        }
                    } else {
                        await NewCategory[categoryNameParam]
                            .create({
                                adminId,
                                subCategoryName,
                                subCategoryId:
                                    CategoryCodes[categoryNameParam] +
                                    "-" +
                                    "SC" +
                                    unitsPlaceConverter(subCategoryCount),
                                productTypes: [],
                            })
                            .then(res => {
                                dataToSendBack = {
                                    createdSubCategoryData: res,
                                    message:
                                        "New subcategory created successfully",
                                }
                            })
                            .catch(e => h.response(e))

                        await NewCount.findOneAndUpdate(
                            {
                                selectMe: "selectMe",
                            },
                            {
                                $inc: {
                                    subCategoryCount: 1,
                                },
                            },
                            {
                                new: true,
                            }
                        )
                            .then(result => {
                                dataToSendBack = {
                                    ...dataToSendBack,
                                    extraMessage:
                                        "Incremented subCategory count to " +
                                        result.subCategoryCount,
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
                        ///////////////////////////////
                        let newNavBarData = []

                        await NewEmptyCategories.findOne({
                            categoryWholeData:
                                "all-cats-sCats-pTypes-incl-pCount",
                        })
                            .then(result => {
                                let { allCategories } = result

                                const addSubcategoryData = () => {
                                    return allCategories.map(cat => {
                                        if (cat.categoryId === categoryId) {
                                            cat.subCategories.push({
                                                subCategoryName,
                                                subCategoryId:
                                                    CategoryCodes[
                                                        categoryNameParam
                                                    ] +
                                                    "-" +
                                                    "SC" +
                                                    unitsPlaceConverter(
                                                        subCategoryCount
                                                    ),
                                                productTypes: [],
                                            })
                                        }

                                        // cat.subCategories.map(sCat => {
                                        //     // sCat.productTypes.map(pType => {
                                        //     //     if(pType.productTypeId === productTypeId){
                                        //     //         testUnique = productTypeId
                                        //     //         pType.productsCount++
                                        //     //     }

                                        //     //     return pType
                                        //     // })
                                        //     // return sCat
                                        // })

                                        return cat
                                    })
                                }

                                newNavBarData = addSubcategoryData()
                            })
                            .catch(e => h.response(e))

                        await NewEmptyCategories.findOneAndUpdate(
                            {
                                categoryWholeData:
                                    "all-cats-sCats-pTypes-incl-pCount",
                            },
                            {
                                allCategories: [...newNavBarData],
                            },
                            {
                                new: true,
                            }
                        )
                            .then(result => {
                                dataToSendBack = {
                                    ...dataToSendBack,
                                    lastMessage: "Added to Navbar data too",
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
                } else {
                    dataToSendBack = {
                        message:
                            "The category name and category ID do not match",
                    }
                }
            }

            await uploadNewSubCategory(categoryName, categoryId)
        } else {
            dataToSendBack = {
                message: "Your password is wrong",
            }
        }

        // })

        // })
        // .catch(e => h.response(e))

        return h.response(dataToSendBack)
    },
}

let newProductType = {
    method: "POST",
    path: "/api/categories/new-product-type",

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
            adminPasscode,
            categoryCount,
            subCategoryCount,
            productTypeCount,
            productCount

        const {
            adminId,
            adminPassword,
            subCategoryId,
            productType,
            categoryId,
            categoryName,
        } = request.payload

        if (adminId === "PRAVAS") {
            adminPasscode = "XXR_@931810@_PXX"
        }

        if (adminId === "HARSH") {
            adminPasscode = "XXN_@891509@_HXX"
        }

        if (adminId === "TIPPU") {
            adminPasscode = "XXN_@922908@_TXX"
        }

        // const theData =

        // fs.readFile( __dirname  + "\\categoryData\\" + categoryName + ".json", "utf-8",
        // (err, res) => {
        //     data = JSON.parse(res)

        //     console.log(data)

        if (adminPasscode === adminPassword) {
            const uploadNewSubCategory = async (
                categoryNameParam,
                categoryIdParam
            ) => {
                // console.log(categoryIdParam, CategoryCodes[categoryNameParam])
                if (categoryIdParam === CategoryCodes[categoryNameParam]) {
                    let productTypeAlreadyExists = false

                    await NewCount.findOne({
                        selectMe: "selectMe",
                    })
                        .then(result => {
                            categoryCount = result.categoryCount
                            subCategoryCount = result.subCategoryCount
                            productTypeCount = result.productTypeCount
                            productCount = result.productCount
                        })
                        .catch(e => h.response(e))

                    // check if subCategory exists
                    await NewCategory[categoryNameParam]
                        .findOne({
                            subCategoryId,
                        })
                        .then(result => {
                            result.productTypes.map((item, i) => {
                                if (
                                    item.productType.toLowerCase() ===
                                    productType.toLowerCase()
                                ) {
                                    productTypeAlreadyExists = true
                                }
                            })
                        })
                        .catch(e => h.response(e))

                    if (productTypeAlreadyExists) {
                        dataToSendBack = {
                            message:
                                "Sorry, couldn't add the new productType because it was already added.",
                        }
                    } else {
                        await NewCategory[categoryNameParam]
                            .findOneAndUpdate(
                                {
                                    subCategoryId,
                                },
                                {
                                    $push: {
                                        productTypes: {
                                            productType: productType,
                                            productTypeId:
                                                subCategoryId +
                                                "-" +
                                                "PT" +
                                                unitsPlaceConverter(
                                                    productTypeCount
                                                ),
                                            products: [],
                                        },
                                    },
                                },
                                {
                                    new: true,
                                }
                            )
                            .then(res => {
                                dataToSendBack = {
                                    updatedSubCategoryData: res,
                                    message:
                                        "New productType created successfully",
                                }
                            })
                            .catch(e => h.response(e))

                        await NewCount.findOneAndUpdate(
                            {
                                selectMe: "selectMe",
                            },
                            {
                                $inc: {
                                    productTypeCount: 1,
                                },
                            },
                            {
                                new: true,
                            }
                        )
                            .then(result => {
                                dataToSendBack = {
                                    ...dataToSendBack,
                                    extraMessage:
                                        "Incremented product type count to " +
                                        result.productTypeCount,
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
                        ///////////////////////////////
                        let newNavBarData = []

                        await NewEmptyCategories.findOne({
                            categoryWholeData:
                                "all-cats-sCats-pTypes-incl-pCount",
                        })
                            .then(result => {
                                let { allCategories } = result

                                const addSubcategoryData = () => {
                                    return allCategories.map(cat => {
                                        cat.subCategories.map(sCat => {
                                            if (
                                                sCat.subCategoryId ===
                                                subCategoryId
                                            ) {
                                                sCat.productTypes.push({
                                                    productTypeName:
                                                        productType,
                                                    productTypeId:
                                                        subCategoryId +
                                                        "-" +
                                                        "PT" +
                                                        unitsPlaceConverter(
                                                            productTypeCount
                                                        ),
                                                    productsCount: 0,
                                                })
                                            }

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
                                categoryWholeData:
                                    "all-cats-sCats-pTypes-incl-pCount",
                            },
                            {
                                allCategories: [...newNavBarData],
                            },
                            {
                                new: true,
                            }
                        )
                            .then(result => {
                                dataToSendBack = {
                                    ...dataToSendBack,
                                    lastMessage: "Added to Navbar data too",
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
                } else {
                    dataToSendBack = {
                        message:
                            "The category name and category ID do not match",
                    }
                }
            }

            await uploadNewSubCategory(categoryName, categoryId)
        } else {
            dataToSendBack = {
                message: "Your password is wrong",
            }
        }

        // })

        // })
        // .catch(e => h.response(e))

        return h.response(dataToSendBack)
    },
}

let ConversionsRoute = [convertCategories, newSubcategory, newProductType]

module.exports = ConversionsRoute
