"use strict"

let UserDataRouter = require("./userRoute/userData")
let VendorDataRouter = require("./userRoute/vendorData")
let UploadImageRouter = require("./commonRoutes/uploadRoute")
let ConversionsRouter = require("./otherRoutes/conversionRoutes")
let CookieDataSetterRouter = require("./otherRoutes/setCookieData")
let ProductsRouter = require("./productRoutes/productsData")
let CategoryRouter = require("./productRoutes/categoryData")
let PaymentRouter = require("./checkoutRoutes/payment")
let NavBarProductsRouter = require("./productNavBarRoutes/navBarProductRoutes")
let AnalyticsRouter = require("./analytics/pageNavigation")

let VendorAdRouter = require("./arcEnquiryRoutes/vendorAd")
let AskForProductsRouter = require("./arcEnquiryRoutes/askForProducts")
let VendorOnboardRouter = require("./arcEnquiryRoutes/vendorOnboard")
let SubmitDesignRouter = require("./arcEnquiryRoutes/customDesignRequest")
let ProductRequestRouter = require("./arcEnquiryRoutes/productQuoteRequest")

let AdminDataRouter = require("./userRoute/adminRoutes")
let NewsLetterRouter = require("./userRoute/subscriber")

let APIs = [
    ...UserDataRouter,
    ...VendorDataRouter,
    ...UploadImageRouter,
    ...ConversionsRouter,
    ...ProductsRouter,
    ...CategoryRouter,
    ...PaymentRouter,
    ...NavBarProductsRouter,
    ...AnalyticsRouter,
    ...VendorAdRouter,
    ...AskForProductsRouter,
    ...VendorOnboardRouter,
    ...SubmitDesignRouter,
    ...ProductRequestRouter,
    ...AdminDataRouter,
    ...CookieDataSetterRouter,
    ...NewsLetterRouter,
]

module.exports = APIs
