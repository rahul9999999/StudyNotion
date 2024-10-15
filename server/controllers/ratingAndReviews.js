const  mongoose  = require("mongoose")
const courseModel = require("../models/course")
const ratingAndReviewModel = require("../models/ratingAndReview")

// CREATE_RATING
exports.createRating=async(req,res)=>{
    try{
        const userId=req.user.id
        const{rating,review,courseId}=req.body
        if(!rating || !courseId){
            return res.status(400).json({
                success:true,
                message:"Please fill details correctly"
            })
        }
        const course=await courseModel.findById(courseId)

        if(!course){
            return res.status(404).json({
                success:true,
                message:"Course not found"
            })
        }

        if(!course.studentEnrolled.includes(userId)){
            return res.status(400).json({
                success:false,
                message:"User not entrolled"
            })
        }

        const ratingExists=await ratingAndReviewModel.findOne({user:userId,course:courseId})

        if(ratingExists){
            return res.status(400).json({
                success:false,
                message:"Review already exists"
            })
        }

        const createRating=await ratingAndReviewModel.create({rating,review,user:userId,course:courseId})

        const updateRating=await courseModel.findByIdAndUpdate(courseId,{$push:{ratingAndReviews:createRating._id}},{new:true})

        return res.status(200).json({
            success:true,
            updateRating,
            message:"rating creating successfully"
        })


    }catch(error){
        console.log(error)
        return res.status(500).json({
            success:false,
            error:error.message,
            message:"Something went wrong while creating rating "
        })

    }

}

// GET_AVARAGE_RATING
exports.getAvarageRating=async(req,res)=>{
    try{
        const {courseId}=req.body

        if(!courseId){
            return res.status(404).json({
                success:false,
                message:"CourseId not given"
            })
        }

        const result=await ratingAndReviewModel.aggregate([
            {$match:{course:new mongoose.Types.ObjectId(courseId)}},
            {$group:{_id:null,avarageRating:{$avg:"$rating"}}}
        ])

        if(result.length>0){
            return res.status(200).json({
                success:true,
                avarageRating:result[0].avarageRating
            })
        }
        else{
            return res.status(200).json({
                success:true,
                message:"Avarage rating is 0 till now",
                avarageRating:0
            })
        }

    }catch(error){
        console.log(error)
        return res.status(500).json({
            success:false,
            error:error.message,
            message:"Something went wrong while avarage rating "
        })

    }
}

// GET_ALL_RATING
exports.getAllRating=async(req,res)=>{
    try{
        const allRating=await ratingAndReviewModel.find({}).sort({rating:"desc"}).
        populate({
            path:"user",
            select:"firstName lastName email image"
        }).populate({
            path:"course",
            select:"courseName"
        }).exec()

        if(!allRating){
            return res.status(404).json({
                success:false,
                message:"rating not found"

            })
        }
        res.status(200).json({
            success:true,
            allRating,
            message:"All rating fetched successfully"
        })


    }catch(error){
        console.log(error)
        return res.status(500).json({
            success:false,
            error:error.message,
            message:"Something went wrong while fetch all rating "
        })

    }
}