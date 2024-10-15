const userModel = require("../models/user")
const profileModel = require("../models/profile")
const courseModel = require("../models/course")
const { uploadToCloudinary } = require("../utils/cloudinary")
const user = require("../models/user")

require("dotenv").config()

exports.updateProfile = async (req, res) => {
	try {
		const { dateOfBirth = "", about = "", contactNumber="",firstName,lastName,gender="" } = req.body;
		const id = req.user.id;

		// Find the profile by id
		const userDetails = await userModel.findById(id);
		const profile = await profileModel.findById(userDetails.additionalDetails);

		// Update the profile fields
		userDetails.firstName = firstName || userDetails.firstName;
		userDetails.lastName = lastName || userDetails.lastName;
		profile.dateOfBirth = dateOfBirth || profile.dateOfBirth;
		profile.about = about || profile.about;
		profile.gender=gender || profile.gender;
		profile.contactNumber = contactNumber || profile.contactNumber;

		// Save the updated profile
		await profile.save();
		await userDetails.save();

		return res.json({
			success: true,
			message: "Profile updated successfully",
			profile,
			userDetails
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			success: false,
			error: error.message,
		});
	}
};

exports.deleteAccount = async (req, res) => {
    try {
        const userId = req.user.id

        const userExists = await userModel.findById(userId)
        if (!userExists) {
            return res.status(400).json({
                success: false,
                message: "User Not found"
            })
        }

        await profileModel.findByIdAndDelete(userExists.additionalDetails)
        const deleteUser = await userModel.findByIdAndDelete(userId)

        res.status(200).json({
            success: true,
            deleteUser,
            message: "User deleted successfully"
        })
    } catch (error) {
        console.log("Delete Account-> ", error)
        res.status(500).json({
            success: false,
            error: error.message,
            message: "Something went wrong while deleting account"
        })

    }

}

exports.getUserDetails = async (req, res) => {
    try {
        const userId = req.user.id
        const userExists = await userModel.findById(userId).populate("additionalDetails").populate("coursesInProgress").exec()

        if (!userExists) {
            return res.status(400).json({
                success: false,
                message: "User Not found"
            })
        }

        res.status(200).json({
            success: true,
            userExists,
            message: "Fetching user details successfully"
        })
    } catch (error) {
        console.log("User Details-> ", error)
        res.status(500).json({
            success: false,
            error: error.message,
            message: "Something went wrong while fetching user details"
        })


    }
}

exports.updateProfilePicture = async (req, res) => {
    try {
        const userId = req.user.id
        const displayPicture = req.files.displayPicture

        const user = await userModel.findById(userId)

        if (!displayPicture) {
            return res.status(400).json({
                success: false,
                message: "Please give details correctly"
            })
        }
        const uploadToCloud = await uploadToCloudinary(displayPicture, process.env.FOLDER_NAME)
        const updateImage = await userModel.findByIdAndUpdate(userId, { image: uploadToCloud.secure_url }, { new: true })

        res.status(200).json({
            success: true,
            updateImage,
            message: "Profile update successfully"
        })

    } catch (error) {
        console.log("Update Profile-> ", error)
        res.status(500).json({
            success: false,
            error: error.message,
            message: "Something went wrong while update profile picture"
        })


    }
}

exports.getEnrolledCourses = async (req, res) => {
    try {
        const id = req.user.id;
        const user = await userModel.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        console.log("User->", user)
        const enrolledCourses = await userModel.findById(id).populate({
            path: "courses",
            populate: {
                path: "courseContent",
                populate: {
                    path: "subSection",
                },
            }
        }
        ).populate("coursesInProgress").exec();
        console.log("Entrolled ->", enrolledCourses);
        res.status(200).json({
            success: true,
            message: "User Data fetched successfully",
            data: enrolledCourses,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

exports.instructorDashboard = async (req, res) => {
    try {
        const id = req.user.id;
        const courseData = await courseModel.find({ instructor: id });
        const courseDetails = courseData.map((course) => {
            totalStudents = course?.studentEnrolled?.length;
            totalRevenue = course?.price * totalStudents;
            const courseStats = {
                _id: course._id,
                courseName: course.courseName,
                courseDescription: course.courseDescription,
                totalStudents,
                totalRevenue,
            };
            return courseStats;
        });
        res.status(200).json({
            success: true,
            message: "User Data fetched successfully",
            data: courseDetails,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}
