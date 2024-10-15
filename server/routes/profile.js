const express =require("express")
const { updateProfile, deleteAccount, getUserDetails, updateProfilePicture, getEnrolledCourses, instructorDashboard } = require("../controllers/profile")
const { auth, isInstructer }=require("../middlewares/auth")
const router=express.Router()
const {isDemo} =require("../middlewares/demo")

router.put("/updateprofile",auth,isDemo,updateProfile)
router.delete("/deleteProfile",auth,isDemo,deleteAccount)
router.get("/getUserDetails",auth,getUserDetails)
router.put("/updateDisplayPicture",auth,isDemo,updateProfilePicture)
router.get("/getenrolledcourses",auth,getEnrolledCourses)
router.get("/getInstructorDashboardDetails",auth,isInstructer, instructorDashboard)

module.exports=router
