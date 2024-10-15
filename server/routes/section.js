const express =require("express")
const { createSection, updateSection, deleteSection } = require("../controllers/section")
const { auth, isInstructer } = require("../middlewares/auth")
const router=express.Router()


router.post("/createSection",auth,isInstructer,createSection)
router.post("/updateSection",auth,isInstructer,updateSection)
router.post("/deleteSection",auth,isInstructer,deleteSection)


module.exports=router