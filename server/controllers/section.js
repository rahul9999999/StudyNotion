const courseModel = require("../models/course")
const sectionModel = require("../models/section")

exports.createSection = async (req, res) => {
    try {
        const { sectionName, courseId } = req.body
        console.log(sectionName,courseId)
        if (!sectionName || !courseId) {
            return res.status(400).json({
                success: false,
                message: "Please fill the deatils correctly"
            })
        }
        const section = await sectionModel.create({ sectionName })
        const course = await courseModel.findByIdAndUpdate(courseId, {
            $push:
                { courseContent: section._id }
        },{new:true}).populate({
            path: "courseContent",
            populate: {
                path: "subSection",
            },
        }).exec();

        console.log("course", course)
        res.status(200).json({
            success: true,
            course,
            message: "Section created Successfully"
        })


    } catch (error) {
        console.log("Section-> ", error)
        res.status(500).json({
            success: false,
            error: error.message,
            message: "Something went wrong whille creating section"
        })
    }

}
exports.updateSection = async (req, res) => {
    try {
        const { sectionName, sectionId, courseId } = req.body
        if (!sectionName || !sectionId || !courseId) {
            return res.status(400).json({
                success: false,
                message: "Please fill the deatils correctly"
            })
        }
        const updateSection = await sectionModel.findByIdAndUpdate(sectionId, { sectionName },
             { new: true })

        const updateCourse= await courseModel.findById(courseId).populate({path:"courseContent",populate:{path:"subSection"}}).exec()

        
        res.status(200).json({
            success: true,
            updateCourse,
            message: "Section Updated successfully"
        })

    } catch (error) {
        console.log("Section_Update-> ", error)
        res.status(500).json({
            success: false,
            error: error.message,
            message: "Something went wrong whille updating section"
        })

    }


}

exports.deleteSection = async (req, res) => {
    try {
        const { sectionId, courseId } = req.body
        if (!sectionId || !courseId) {
            return res.status(400).json({
                success: false,
                message: "Please fill the deatils correctly"
            })
        }
        const sectionDelete = await sectionModel.findByIdAndDelete(sectionId)
        const updateCourse= await courseModel.findByIdAndUpdate(courseId,{$pull:{courseContent:sectionId}},{new:true}).populate({path:"courseContent",
            populate:{path:"subSection"}}).exec()

        res.status(200).json({
            success: true,
            updateCourse,
            message: "Section deleted successfully"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: "Something went wrong whille updating section"
        })

    }


}