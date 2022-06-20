"use strict"

const baseBucketURL = "rolling-logs/images/"

const s3BucketCredentials = {
    bucket: {
        images: {
            vendor: {
                profilePictures: baseBucketURL + "vendor/profile-pictures",
                regularImages: baseBucketURL + "vendor/regular-images",
                thumbs: baseBucketURL + "vendor/thumbs",
            },

            architect: {
                profilePictures: baseBucketURL + "architect/profile-pictures",
                regularImages: baseBucketURL + "architect/regular-images",
                thumbs: baseBucketURL + "architect/thumbs",
            },

            student: {
                profilePictures: baseBucketURL + "student/profile-pictures",
                regularImages: baseBucketURL + "student/regular-images",
                thumbs: baseBucketURL + "student/thumbs",
            },

            client: {
                profilePictures: baseBucketURL + "client/profile-pictures",
                regularImages: baseBucketURL + "client/regular-images",
                thumbs: baseBucketURL + "client/thumbs",
            },
        },

        appData: {
            appImages: "app-data/app-images",
        },
    },

    accessKeyId: "",
    secretAccessKey: "",
    s3URL: "https://",
}

module.exports = {
    s3BucketCredentials: s3BucketCredentials,
}
