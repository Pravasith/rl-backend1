const corsHeaders = {
    origin: [
        // "http://localhost:3000",
        "https://rl.pravasdesign.com",
        "https://www.rl.pravasdesign.com",

        // "https://rollinglogs.com",
        // "https://www.rollinglogs.com",
        // // "https://www.linkedin.com/uas/oauth2/authorization",
        // "http://rolling-logs-admin.s3-website.ap-south-1.amazonaws.com",
        // "https://www.vendor.rollinglogs.com",
        // "https://vendor.rollinglogs.com",
    ],
    // headers: ["Access-Control-Allow-Origin","Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type"],
    credentials: true,
}

module.exports = corsHeaders
