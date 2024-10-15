const sectionModel = require("../models/section")
const subSectionModel = require("../models/subSection")
const courseModel = require("../models/course")
const { uploadToCloudinary } = require("../utils/cloudinary")
const cloudinary = require('cloudinary').v2
require("dotenv").config()

exports.creatingSubSection = async (req, res) => {
    try {
        console.log("file")
        const { title, description, sectionId, courseId } = req.body
        const file = req.files.videoFile


        if (!title || !description || !file || !sectionId || !courseId) {
            return res.status(400).json({
                success: false,
                message: "Please fill the deatils correctly"
            })
        }

        const ifsection = await sectionModel.findById(sectionId);
        if (!ifsection) {
            return res
                .status(404)
                .json({ success: false, message: "Section not found" });
        }

        const video = await uploadToCloudinary(file, process.env.FOLDER_NAME)

        console.log("video",video)
        const subSectionCreate = await subSectionModel.create({
            title,
            description,
            videoUrl: {
                public_id:video.public_id,
                url:video.secure_url
            }
        })
        const updateSection = await sectionModel.findByIdAndUpdate(sectionId, { $push: { subSection: subSectionCreate._id } }, { new: true })

        const updateCourse = await courseModel.findById(courseId).populate({ path: "courseContent", populate: { path: "subSection" } }).exec()

        res.status(200).json({
            success: true,
            updateCourse,
            message: "Subsection creating successfully"
        })
    } catch (error) {
        console.log("SubSection-> ", error)
        res.status(500).json({
            success: false,
            error: error.message,
            message: "Something went wrong while creating subSection"
        })

    }
}

exports.updateSubSection = async (req, res) => {
    try {
        const { title, description, courseId, subSectionId } = req.body
        const deleteVideoFromCloudinary = await subSectionModel.findById(subSectionId)

        const file = req?.files?.videoFile

        if (!courseId || !subSectionId) {
            return res.status(400).json({
                success: false,
                message: "Please fill the deatils correctly"
            })
        }

        let uploadCloudinary = null
        if (file) { 
            uploadCloudinary = await uploadToCloudinary(file, process.env.FOLDER_NAME)
        }

        // also delete from cloudinary last img 


        const updateDetails = await subSectionModel.findByIdAndUpdate(subSectionId, {
            title: title || subSectionModel.title,
            description: description || subSectionModel.description,
            videoUrl: uploadCloudinary && {url:uploadCloudinary?.secure_url,
                public_id:uploadCloudinary.public_id} || subSectionModel.videoUrl
        }, { new: true })

        if(file){
            await cloudinary.uploader.destroy(deleteVideoFromCloudinary.videoUrl.public_id,{invalidate:true,resource_type:"video"})
        }

        const updateCourse = await courseModel.findById(courseId).populate({ path: "courseContent", populate: { path: "subSection" } }).exec();

        res.status(200).json({
            success: true,
            updateCourse,
            message: "SubSection updated successfully"
        })
    } catch (error) {
        console.log("SubSectionUpdate-> ", error)
        res.status(500).json({
            success: false,
            error: error.message,
            message: "Something went wrong while updating subSection"
        })

    }

}

exports.deleteSubSection = async (req, res) => {
    try {
        const { subSectionId, courseId, sectionId } = req.body

        if (!subSectionId || !courseId || !sectionId) {
            return res.status(400).json({
                success: false,
                message: "Please fill details correctly"
            })
        }


        const deleteFromCloudinary= await subSectionModel.findById(subSectionId)

        await subSectionModel.findByIdAndDelete(subSectionId)

        await sectionModel.findByIdAndUpdate(sectionId, { $pull: { subSection: subSectionId } }, { new: true })

        const updateCourse = await courseModel.findById(courseId).populate({ path: "courseContent", populate: { path: "subSection" } }).exec();

        // also delete from cloudinary last img 
        
        await cloudinary.uploader.destroy(deleteFromCloudinary.videoUrl.public_id,{ invalidate: true, resource_type: "video" }).then(result => console.log("result",result));

        res.status(200).json({
            success: true,
            updateCourse,
            message: "SubSection deleted successfully"
        })



    } catch (error) {
        console.log("SubSectionDelete-> ", error)
        res.status(500).json({
            success: false,
            error: error.message,
            message: "Something went wrong while deleting subSection"
        })

    }
}