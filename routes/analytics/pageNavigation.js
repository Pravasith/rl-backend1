// Which product types are people most searching for?
// Which products are mostly sought after
// What part of the page is most focussed?

"use strict"

// External dependencies
const Joi = require("joi")

const DataEncrypterAndDecrypter = require("../../factories/encryptDecrypt")
const CategoryNames = require("../../lib/categoryNames")

const NewTrendingProducts = require("../../models/newTrendingProducts")
const NewSubCategoryAnalytics = require("../../models/newAnalytics")

const corsHeaders = require("../../lib/routeHeaders")

let createTop30Trending = {
    method: "POST",
    path: "/api/trending/top-30",

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
            productName: Joi.string().max(150).required(),
            productId: Joi.string().max(80).required(),
            productDiscount: Joi.number().max(100),
            productThumb: Joi.string().max(9000).required(),
            subCategoryName: Joi.string().max(150).required(),
            productTypeName: Joi.string().max(150).required(),
            brandDetails: Joi.object().keys({
                brandImage: Joi.string().max(150),
                brandName: Joi.string().max(150),
            }),
            price: Joi.number().max(999999999999).required(),
            productImages: Joi.array()
                .items(Joi.string().max(9000).required())
                .required(),
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

        let dataToSendBack

        if (dataPassesValidation === true) {
            let {
                productName,
                productId,
                productDiscount,
                productThumb,
                subCategoryName,
                productTypeName,
                brandDetails,
                price,
                productImages,
            } = decryptedData

            if (productDiscount === undefined) {
                productDiscount = 0
            }

            const categoryId = productId.split("-")[0]
            const categoryName = CategoryNames[categoryId]
            let productExists = false,
                productData = {}

            let upsertData = {
                categoryId,
                categoryName,
                trending200: [
                    {
                        productName,
                        productId,
                        productDiscount,
                        productThumb,
                        subCategoryName,
                        productTypeName,
                        brandDetails,
                        price,
                        productImages,
                        views: 1,
                    },
                ],
            }

            const newProductData = {
                productName,
                productId,
                productDiscount,
                productThumb,
                subCategoryName,
                productTypeName,
                brandDetails,
                price,
                productImages,
            }

            await NewTrendingProducts.findOne({
                categoryId,
            })
                .then(res => {
                    if (res) {
                        productExists = true
                        productData = {
                            ...res._doc,
                        }
                    } else {
                        productExists = false
                    }
                })
                .catch(e => {
                    console.error(e)
                    h.response(e)
                })

            if (!productExists) {
                await NewTrendingProducts.create({
                    ...upsertData,
                })
                    .then(res => {
                        dataToSendBack = {
                            ...res._doc,
                        }
                    })
                    .catch(e => {
                        console.error(e)
                        h.response(e)
                    })
            } else {
                let existingData = {
                    ...productData,
                }

                let productFoundInData = false
                let newTrending200 = existingData.trending200.map((item, i) => {
                    if (item.productId === productId) {
                        productFoundInData = true
                        return {
                            ...item,
                            ...newProductData,
                            views: item.views + 1,
                        }
                    } else {
                        return item
                    }
                })

                if (productFoundInData === false) {
                    if (existingData.trending200.length <= 99) {
                        newTrending200.push({
                            ...newProductData,
                            views: 1,
                        })
                    } else if (existingData.trending200.length > 99) {
                        function compare(a, b) {
                            if (a.views < b.views) return -1
                            if (a.views > b.views) return 1
                            return 0
                        }

                        let newTrending200Refined = newTrending200.sort(compare) // sorts all items in ascending order
                        let lastProductViews = newTrending200Refined[0].views

                        // Removing the object with least views
                        // and replacing it with new object

                        newTrending200 = [
                            ...newTrending200Refined.filter((item, i) => i > 0),
                        ]

                        newTrending200.push({
                            ...newProductData,
                            views: 1,
                        })
                    }
                }

                await NewTrendingProducts.findOneAndUpdate(
                    {
                        categoryId,
                    },
                    {
                        $set: {
                            trending200: [...newTrending200],
                        },
                    },
                    {
                        new: true, // return new doc if one is upserted
                    }
                )
                    .then(res => {
                        dataToSendBack = {
                            ...res._doc,
                        }

                        function compare(a, b) {
                            if (a.views < b.views) return -1
                            if (a.views > b.views) return 1
                            return 0
                        }

                        dataToSendBack = {
                            ...dataToSendBack,
                            trending200:
                                dataToSendBack.trending200.sort(compare),
                        }
                    })
                    .catch(e => {
                        console.error(e)
                        h.response(e)
                    })
            }

            //
            // Encrypt data
            //
            dataToSendBack = {
                responseData:
                    DataEncrypterAndDecrypter.encryptData(dataToSendBack),
                message:
                    "Alpha niner foxtrot, this is Omega Attend B, deep analytics complete.",
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

let getTop20ProductsInCategory = {
    method: "POST",
    path: "/api/trending/top-20-in-category",

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
            categoryId: Joi.string().max(8).required(),
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

        let dataToSendBack

        if (dataPassesValidation === true) {
            let { categoryId } = decryptedData

            // console.log(categoryId)

            await NewTrendingProducts.findOne({
                categoryId,
            })
                .then(res => {
                    dataToSendBack = {
                        ...res._doc,
                    }

                    function compare(a, b) {
                        if (a.views < b.views) return 1
                        if (a.views > b.views) return -1
                        return 0
                    }

                    dataToSendBack = {
                        trending20: dataToSendBack.trending200
                            .sort(compare)
                            .filter((item, i) => i < 20),
                    }
                })
                .catch(e => {
                    console.error(e)
                    h.response(e)
                })

            //
            // Encrypt data
            //
            dataToSendBack = {
                responseData:
                    DataEncrypterAndDecrypter.encryptData(dataToSendBack),
                message:
                    "Alpha niner foxtrot, this is Omega Attend B, deep analytics complete.",
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

let topSubCategoryProductTypeClicks = {
    method: "PUT",
    path: "/api/trending/top-subcategories",

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
            isSubCat: Joi.boolean().required(),
            fetchId: Joi.string().max(40).required(),
            subCategoryName: Joi.string().max(240).required(),
            categoryName: Joi.string().max(240).required(),
            productTypeName: Joi.string().max(240).required(),
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

        let dataToSendBack

        if (dataPassesValidation === true) {
            let {
                isSubCat,
                fetchId,
                subCategoryName,
                categoryName,
                productTypeName,
            } = decryptedData

            let d = new Date()
            let dOffset = d.getTimezoneOffset()

            let ISTOffset = 330
            let ISTTime = new Date(d.getTime() + (ISTOffset + dOffset) * 60000)

            // console.log(GetISTTime())

            let theQuery = {
                    fetchId,
                },
                theUpdate = {
                    isSubCat,
                    subCategoryName,
                    categoryName,
                    productTypeName,
                    $inc: {
                        viewCount: 1,
                    },
                    // time : Date.now
                    $push: {
                        datesViewed: `${ISTTime.getDate()}-${
                            ISTTime.getMonth() + 1
                        }-${ISTTime.getFullYear()}T${ISTTime.getHours()}:${ISTTime.getMinutes()}`,
                    },
                },
                theOptions = {
                    upsert: true,
                    new: true,
                    setDefaultsOnInsert: true,
                }

            await NewSubCategoryAnalytics.findOneAndUpdate(
                theQuery,
                theUpdate,
                theOptions
            )
                .then(res => {
                    dataToSendBack = res
                })
                .catch(e => {
                    console.error(e)
                    h.response(e)
                })

            //
            // Encrypt data
            //
            dataToSendBack = {
                responseData:
                    DataEncrypterAndDecrypter.encryptData(dataToSendBack),
                message:
                    "Alpha niner foxtrot, this is Omega Attend B, deep analytics complete.",
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

let getTopSubCategories = {
    method: "GET",
    path: "/api/trending/get-top-subcategories",

    config: {
        cors: corsHeaders,
        auth: {
            strategy: "restricted",
        },
        tags: ["api"],
    },
    handler: async (request, h) => {
        let dataToSendBack

        const { page, sort_by, sort_type } = request.query

        let sortBy

        if (sort_by === "views") {
            sortBy = "viewCount"
        } else if (sort_by === "time") {
            sortBy = "time"
        } else if (sort_by === "category") {
            sortBy = "categoryName"
        } else if (sort_by === "sub_category") {
            sortBy = "subCategoryName"
        } else if (sort_by === "product_type") {
            sortBy = "productTypeName"
        }

        let sortOption = {}

        sortOption[sortBy] = Number(sort_type)

        await NewSubCategoryAnalytics.aggregate([
            {
                $match: {},
            },
            {
                $sort: sortOption,
                // {
                //     'viewCount' : -1
                // }
            },
            {
                $facet: {
                    metadata: [
                        { $count: "total" },
                        { $addFields: { page: Number(page) } },
                    ],
                    data: [{ $skip: Number(page) * 50 }, { $limit: 50 }], // add projection here wish you re-shape the docs
                },
            },
        ])
            .then(res => {
                dataToSendBack = res
                // console.log(res)
            })
            .catch(e => {
                console.error(e)
                h.response(e)
            })

        //
        // Encrypt data
        //
        dataToSendBack = {
            responseData: DataEncrypterAndDecrypter.encryptData(dataToSendBack),
            message:
                "Alpha niner foxtrot, this is Omega Attend B, deep analytics complete.",
        }
        //
        // Encrypt data
        //

        return h.response(dataToSendBack)
    },
}

//// Homepage routes start /////

let getBestOffers = {
    method: "GET",
    path: "/api/trending/top-offers",

    config: {
        cors: corsHeaders,
        auth: {
            strategy: "restricted",
            mode: "try",
        },
        tags: ["api"],
    },
    handler: async (request, h) => {
        let dataToSendBack = {
            topOffersGIFS: [
                {
                    name: "Bathtubs - Upto 6% off",
                    imageURL:
                        "https://res.cloudinary.com/rolling-logs/image/upload/c_scale,w_300/regularImage-VEN-pmx8aov6BpDhOBA-1UHjzIdHLQ-1553599336762",
                    hrefLink:
                        "/products/bathroom-products/showers-and-bathtubs/bathtubs/002400040001",
                },
                {
                    name: "Kitchen discounts - Upto 40% off",
                    imageURL:
                        "https://res.cloudinary.com/rolling-logs/image/upload/c_scale,w_300/regularImage-VEN-pmx8aov6BpDhOBA-SE0zAKSsL0-1553599342484",
                    hrefLink:
                        "/products/kitchen-products/kitchen-appliances/cooker-hoods/048700530017",
                },
                {
                    name: "Windows discounts - Upto 5% off",
                    imageURL:
                        "https://res.cloudinary.com/rolling-logs/image/upload/c_scale,w_300/regularImage-VEN-pmx8aov6BpDhOBA-52YliQi5rS-1553599354874",
                    hrefLink:
                        "/products/window-products/windows/bow-windows/082400830031",
                },
                {
                    name: "Lighting discounts - Upto 7% off",
                    imageURL:
                        "https://res.cloudinary.com/rolling-logs/image/upload/c_scale,w_300/regularImage-VEN-pmx8aov6BpDhOBA-8NTBdHBlvY-1553599348072",
                    hrefLink:
                        "/products/lighting-products/interior-lighting/pendant-lamps/060700590019",
                },
            ],

            topOffers: [
                {
                    productImageURL:
                        "https://res.cloudinary.com/rolling-logs/image/upload/c_scale,w_300/regularImage-VEN-pmx8aov6BpDhOBA-M4O8aocj7R-1553606371562",
                    productTitle: "laminates-upto-6%-off",
                    productLink:
                        "/products/finishing/laminates/plywood-laminates/088300870009",
                },

                {
                    productImageURL:
                        "https://res.cloudinary.com/rolling-logs/image/upload/c_scale,w_300/regularImage-VEN-pmx8aov6BpDhOBA-CNW6Z7pXQx-1553606622119",
                    productTitle: "taps-and-faucets-4%-off",
                    productLink:
                        "/products/bathroom-products/showers-and-bathtubs/bathroom-taps/003200040001",
                },

                {
                    productImageURL:
                        "https://res.cloudinary.com/rolling-logs/image/upload/c_scale,w_300/regularImage-VEN-pmx8aov6BpDhOBA-SOCc5EQtI2-1553610047854",
                    productTitle: "kitchen-taps-4%-off",
                    productLink:
                        "/products/kitchen-products/sinks-and-kitchen-taps/kitchen-taps/048600520017",
                },

                {
                    productImageURL:
                        "https://res.cloudinary.com/rolling-logs/image/upload/c_scale,w_300/regularImage-VEN-pmx8aov6BpDhOBA-MMQWhabkEf-1553609710505",
                    productTitle: "doors-upto-5%-off",
                    productLink:
                        "/products/doors-products/entrance-doors/wooden-doors/020300210005",
                },

                {
                    productImageURL:
                        "https://res.cloudinary.com/rolling-logs/image/upload/c_scale,w_300/regularImage-VEN-pmx8aov6BpDhOBA-g0r4WBOowg-1553611196668",
                    productTitle: "showers-5%-off",
                    productLink:
                        "/products/bathroom-products/showers-and-bathtubs/overhead-showers/003300040001",
                },
                {
                    productImageURL:
                        "https://res.cloudinary.com/rolling-logs/image/upload/c_scale,w_300/regularImage-VEN-pmx8aov6BpDhOBA-p2s7v4liWs-1550753967901",
                    productTitle: "kitchen-products",
                    productLink:
                        "/products/lighting-products/interior-lighting/ceiling-lamps/060800590019",
                },

                {
                    productImageURL:
                        "https://res.cloudinary.com/rolling-logs/image/upload/c_scale,w_300/regularImage-VEN-pmx8aov6BpDhOBA-xB7P9qcQtV-1553609968534",
                    productTitle: "chimneys-hoods-40%-off",
                    productLink:
                        "/products/kitchen-products/kitchen-appliances/cooker-hoods/048700530017",
                },

                {
                    productImageURL:
                        "https://res.cloudinary.com/rolling-logs/image/upload/c_scale,w_300/regularImage-VEN-pmx8aov6BpDhOBA-VVCyrJR0HP-1553610220669",
                    productTitle: "stoves-hobs-30%-off",
                    productLink:
                        "/products/kitchen-products/kitchen-appliances/hobs/049200530017",
                },

                {
                    productImageURL:
                        "https://res.cloudinary.com/rolling-logs/image/upload/c_scale,w_300/regularImage-VEN-pmx8aov6BpDhOBA-pmyLdi0V92-1553610427531",
                    productTitle: "plywood-3%-off",
                    productLink:
                        "/products/wood-products/wood-and-timber/plywood/087300840032",
                },

                {
                    productImageURL:
                        "https://res.cloudinary.com/rolling-logs/image/upload/c_scale,w_300/regularImage-VEN-pmx8aov6BpDhOBA-dCiuuzbKsQ-1553610546209",
                    productTitle: "lighting-fixtures-7%-off",
                    productLink:
                        "/products/lighting-products/interior-lighting/pendant-lamps/060700590019",
                },

                {
                    productImageURL:
                        "https://res.cloudinary.com/rolling-logs/image/upload/c_scale,w_300/regularImage-VEN-pmx8aov6BpDhOBA-fdSFS61q4u-1553610602674",
                    productTitle: "bathroom-sinks-5%-off",
                    productLink:
                        "/products/bathroom-products/bathroom-fixtures-and-washbasins/washbasins/001900030001",
                },

                {
                    productImageURL:
                        "https://res.cloudinary.com/rolling-logs/image/upload/c_scale,w_300/regularImage-VEN-pmx8aov6BpDhOBA-JXsqgxA6zr-1553610818954",
                    productTitle: "exhaust-fans-5%-off",
                    productLink:
                        "/products/kitchen-products/kitchen-appliances/exhaust-fans/089400530017",
                },

                {
                    productImageURL:
                        "https://res.cloudinary.com/rolling-logs/image/upload/c_scale,w_300/regularImage-VEN-pmx8aov6BpDhOBA-E1yx60pt78-1553610897154",
                    productTitle: "kitchen-sinks-5%-off",
                    productLink:
                        "/products/kitchen-products/sinks-and-kitchen-taps/sinks/048500520017",
                },

                {
                    productImageURL:
                        "https://res.cloudinary.com/rolling-logs/image/upload/c_scale,w_300/regularImage-VEN-pmx8aov6BpDhOBA-OJu5iivy9O-1553610961894",
                    productTitle: "kitchen-baskets-5%-off",
                    productLink:
                        "/products/kitchen-products/kitchen-furniture/kitchen-accessories/048400510017",
                },
                {
                    productImageURL:
                        "https://res.cloudinary.com/rolling-logs/image/upload/c_scale,w_300/regularImage-VEN-pmx8aov6BpDhOBA-OywrWpLnd6-1553611476582",
                    productTitle: "bathtubs-6%-off",
                    productLink:
                        "/products/bathroom-products/showers-and-bathtubs/bathtubs/002400040001",
                },
            ],
        }

        //
        // Encrypt data
        //
        dataToSendBack = {
            responseData: DataEncrypterAndDecrypter.encryptData(dataToSendBack),
            message: "Incoming spray. Brace for impact",
        }
        //
        // Encrypt data
        //

        return h.response(dataToSendBack)
    },
}

//// Homepage routes end /////

let TrendingRoute = [
    createTop30Trending,
    getTop20ProductsInCategory,
    topSubCategoryProductTypeClicks,
    getBestOffers,
    getTopSubCategories,
]

module.exports = TrendingRoute
