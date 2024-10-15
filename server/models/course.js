const mongoose = require("mongoose")
const courseSchema =
    new mongoose.Schema({
        courseName: {
            type: String,
            required: true
        },
        courseDescription: {
            type: String,
            required: true
        },
        instructor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        whatYouWillLearn: {
            type: String,
            required: true
        },
        courseContent: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Section",
            required: true
        }],
        ratingAndReviews: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "RatingAndReview",
            required: true
        }],
        thumbnail: {
            url: {
                type: String,
                required: true
            },
            public_id: {
                type: String,
                required: true
            }
        },
        price: {
            type: Number,
            required: true
        },
        tag: {
            type: [String],
            required: true
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true
        },
        studentEnrolled: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }],
        instruction: {
            type: [String]
        },
        status: {
            type: String,
            enum: ["Draft", "Published"]
        },

    },{timestamps:true})
module.exports = mongoose.model("Course", courseSchema)