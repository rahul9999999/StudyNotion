const express =require("express")
const { createCourse,showAllCouses,getcourseDetails, editCourse, getInstructorCourses, deleteCourse, getFullCourseDetails, markLectureAsComplete, searchCourse } = require("../controllers/course")
const { auth, isInstructer, isStudent }=require("../middlewares/auth")
const router=express.Router()
const {isDemo} =require("../middlewares/demo")

router.post("/createCourse",auth,isDemo,isInstructer,createCourse)
router.get("/showAllcouses",showAllCouses)
router.post("/getCourseDetails",getcourseDetails)
router.post("/editCourse", auth,isDemo, isInstructer,editCourse)
router.get("/getInstructorCourses", auth, isInstructer, getInstructorCourses)
router.delete("/deleteCourse",auth,isDemo,deleteCourse)
router.post("/getFullCourseDetails", auth, getFullCourseDetails)
router.post("/markLectureAsComplete",auth,isStudent,markLectureAsComplete)
router.post("/searchCourse",searchCourse)

module.exports=router