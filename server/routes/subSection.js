const express =require("express")
const { creatingSubSection, deleteSubSection, updateSubSection } = require("../controllers/subSection")
const { auth, isInstructer } = require("../middlewares/auth")
const router=express.Router()


router.post("/creatingSubSection",auth,isInstructer,creatingSubSection)
router.post("/updateSubSection",auth,isInstructer,updateSubSection)
router.post("/deleteSubSection",auth,isInstructer,deleteSubSection)

module.exports=router