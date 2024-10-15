
const courseModel = require("../models/course")
const categoryModel = require("../models/category")
const { uploadToCloudinary } = require("../utils/cloudinary")
const userModel = require("../models/user")
const sectionModel = require("../models/section")
const subSectionModel = require("../models/subSection")
const courseProgressModel = require("../models/courseProgress")
const { convertSecondsToDuration}= require("../utils/secToDuration");
const cloudinary = require('cloudinary').v2
require("dotenv").config()

exports.createCourse = async (req, res) => {
  try {
    let { courseName, courseDescription, whatYouWillLearn, price, tag, category, status, instruction } = req.body
    const thumbnail = req.files.thumbnailImage

    const instructerId = req.user.id

    if (!courseName || !courseDescription || !whatYouWillLearn || !price || !tag || !thumbnail || !instructerId || !category) {
      return res.status(400).json({
        success: false,
        message: "Please fill the details correctly"
      })
    }

    if (!status || status === undefined) {
      status = "Draft"
    }

    const instructerDetails = await userModel.findById(instructerId, { accountType: "Instructer" })

    if (!instructerDetails) {
      return res.status(400).json({
        success: false,
        message: "Instructer Details Not Found"
      })
    }

    const categoryDetails = await categoryModel.findById(category)

    if (!categoryDetails) {
      return res.status(400).json({
        success: false,
        message: "Invalid categoryId-->Not Found"
      })
    }

    const thumbnailImage = await uploadToCloudinary(thumbnail, process.env.FOLDER_NAME)

    const CourseCreating = await courseModel.create({
      courseName,
      courseDescription,
      whatYouWillLearn,
      price,
      tag:JSON.parse(tag),
      category: categoryDetails._id,
      thumbnail: {
        url:thumbnailImage.secure_url,
        public_id:thumbnailImage.public_id
      },
      instructor: instructerDetails._id,
      status,
      instruction:JSON.parse(instruction)
    }) 

    await userModel.findByIdAndUpdate(instructerId, { $push: { courses: CourseCreating._id } }, { new: true })

    await categoryModel.findByIdAndUpdate(category, { $push: { courses: CourseCreating._id } }, { new: true })


    res.status(200).json({
      success: true,
      CourseCreating,
      message: "Course created successfully"
    })

  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      error: error.message,
      message: "Something went wrong while creating course"
    })

  }

}

exports.showAllCouses = async (req, res) => {
  try {
    const courses = await courseModel.find({})
    if (!courses) {
      return res.status(400).json({
        success: false,
        message: "No courses found"
      })
    }
    res.status(200).json({
      success: true,
      courses,
      message: "courses found successfully"
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      error: error.message,
      message: "Something went wrong while founding all courses"
    })

  }

}

exports.getcourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Please fill the details correctly"
      })
    }
    const courseDetails = await courseModel.findById(courseId).
      populate({
        path: "instructor",
        populate: {
          path: "additionalDetails"
        }
      }).populate({
        path: "courseContent",
        populate: {
          path: "subSection"
        }
      }).populate({
        path:"ratingAndReviews",
        populate :{
          path:"user"
        }
      }).
      populate("category").
      exec()

    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: "course not found"
      })
    }

    res.status(200).json({
      success: true,
      courseDetails,
      message: "Course details fetched successfully"
    })

  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      error: error.message,
      message: "Something went wrong while founding all courses"
    })


  }
}

exports.editCourse = async (req, res) => {
  try {
    const { courseId } = req.body
    const updates = req.body
    const course = await courseModel.findById(courseId)
    const thumbnailId=await courseModel.findById(courseId)

    console.log("updates",updates)

    if (!course) {
      return res.status(404).json({ error: "Course not found" })
    }

    // If Thumbnail Image is found, update it
    if (req.files) {
      console.log("thumbnail update")
      const thumbnail = req.files.thumbnailImage
      const thumbnailImage = await uploadToCloudinary(
        thumbnail,
        process.env.FOLDER_NAME
      )
      course.thumbnail = {
        url:thumbnailImage.secure_url,
        public_id:thumbnailImage.public_id
      }
    }

    // Update only the fields that are present in the request body
    for (const key in updates) {
      if (updates.hasOwnProperty(key)) {
        if (key === "tag" || key === "instruction") {
          course[key] = JSON.parse(updates[key])
        } else {
          course[key] = updates[key]
        }
      }
    }

    await course.save()

    const updatedCourse = await courseModel.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec()

    if(req.files){
      await cloudinary.uploader.destroy(thumbnailId.thumbnail.public_id).then(result => console.log("result",result));
    }

    res.json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}

exports.getInstructorCourses = async (req, res) => {
  try {
    // Get user ID from request object
    const userId = req.user.id;

    // Find all courses of the instructor
    const allCourses = await courseModel.find({ instructor: userId });

    // Return all courses of the instructor
    res.status(200).json({
      success: true,
      data: allCourses,
    });
  } catch (error) {
    // Handle any errors that occur during the fetching of the courses
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch courses",
      error: error.message,
    });
  }
}

exports.deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.body

    const course = await courseModel.findById(courseId)
    console.log("course",course)

    const studentEnrolled = course.studentEnrolled

    for (let student of studentEnrolled) {
      await userModel.findByIdAndUpdate(student, { $pull: { course: courseId } }, { new: true })
    }
    const courseContent = course.courseContent

    for (let sectionId of courseContent) {
      const section = await sectionModel.findById(sectionId)
      if(section){
        const subSection = section.subSection
        for (let subSectionId of subSection) {
          const deleteSubSectionFromCloudinary=await subSectionModel.findById(subSectionId)

          await subSectionModel.findByIdAndDelete(subSectionId)

          await cloudinary.uploader.destroy(deleteSubSectionFromCloudinary.videoUrl.public_id,{invalidate:true,resource_type:"video"}).then(result => console.log("result",result));

        }
      }

      await sectionModel.findByIdAndDelete(sectionId)

    }

    const categoryId = course.category
    console.log("categoryId",categoryId._id)

    await categoryModel.findByIdAndUpdate(categoryId, { $pull: { courses: courseId } }, { new: true })

    await userModel.findByIdAndUpdate(req.user.id, { $pull: { courses: courseId } }, { new: true })

    await courseModel.findByIdAndDelete(courseId)

    await cloudinary.uploader.destroy(course.thumbnail.public_id).then(result => console.log("result",result));

    return res.status(200).json({
      success: true,
      message: 'Course Deleted Successfully'
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    })
  }




}

exports.getFullCourseDetails = async (req, res) => {
	try {
	  const { courseId } = req.body
	  const userId = req.user.id
	  const courseDetails = await courseModel.findOne({
		_id: courseId,
	  })
		.populate({
		  path: "instructor",
		  populate: {
			path: "additionalDetails",
		  },
		})
		.populate("category")
		.populate("ratingAndReviews")
		.populate({
		  path: "courseContent",
		  populate: {
			path: "subSection",
		  },
		})
		.exec()

		
	  let courseProgressCount = await courseProgressModel.findOne({
		courseID: courseId,
		userID: userId,
	  })
  
	  console.log("courseProgressCount : ", courseProgressCount)
  
	  if (!courseDetails) {
		return res.status(400).json({
		  success: false,
		  message: `Could not find course with id: ${courseId}`,
		})
	  }
  
  
	  let totalDurationInSeconds = 0
	  courseDetails.courseContent.forEach((content) => {
		content.subSection.forEach((subSection) => {
		  const timeDurationInSeconds = parseInt(subSection.timeDuration)
		  totalDurationInSeconds += timeDurationInSeconds;
		})
	  })
  
	  const totalDuration = convertSecondsToDuration(totalDurationInSeconds)
  
	  return res.status(200).json({
		success: true,
		data: {
		  courseDetails,
		  totalDuration,
		  completedVideos: courseProgressCount?.completedVideos
			? courseProgressCount?.completedVideos
			: [],
		},
	  })
	} catch (error) {
	  return res.status(500).json({
		success: false,
		message: error.message,
	  })
	}
  }

exports.searchCourse = async (req, res) => {
    try {
      const  { searchQuery }  = req.body
    //   console.log("searchQuery : ", searchQuery)
      const courses = await courseModel.find({
      $or: [
        { courseName: { $regex: searchQuery, $options: "i" } },
        { courseDescription: { $regex: searchQuery, $options: "i" } },
        { tag: { $regex: searchQuery, $options: "i" } },
      ],
    })
    .populate({
    path: "instructor",  })
    .populate("category")
    .populate("ratingAndReviews")
    .exec();
  
    return res.status(200).json({
    success: true,
    data: courses,
      })
    } catch (error) {
      return res.status(500).json({
      success: false,
      message: error.message,
      })
    }		
  }				
exports.markLectureAsComplete = async (req, res) => {
    const { courseID, subSectionId, userID } = req.body
    if (!courseID || !subSectionId || !userID) {
      return res.status(400).json({
      success: false,
      message: "Missing required fields",
      })
    }
    try {
    progressAlreadyExists = await courseProgressModel.findOne({
            userID: userID,
            courseID: courseID,
          })
      const completedVideos = progressAlreadyExists.completedVideos
      if (!completedVideos.includes(subSectionId)) {
      await courseProgressModel.findOneAndUpdate(
        {
        userID: userID,
        courseID: courseID,
        },
        {
        $push: { completedVideos: subSectionId },
        }
      )
      }else{
      return res.status(400).json({
        success: false,
        message: "Lecture already marked as complete",
        })
      }
      await courseProgressModel.findOneAndUpdate(
      {
        userId: userID,
        courseID: courseID,
      },
      {
        completedVideos: completedVideos,
      }
      )
    return res.status(200).json({
      success: true,
      message: "Lecture marked as complete",
    })
    } catch (error) {
      return res.status(500).json({
      success: false,
      message: error.message,
      })
    }
  
  }



