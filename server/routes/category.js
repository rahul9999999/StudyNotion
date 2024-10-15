const express =require("express")
const { createCategory, showAllCategories, categoryPageDetails, getCategoryId } = require("../controllers/category")
const { auth, isAdmin, isInstructer } = require("../middlewares/auth")
const router=express.Router()


router.post("/createcategory",auth,isAdmin,createCategory)
router.get("/showAllCategories",showAllCategories)
router.post("/getCategoryPageDetails",categoryPageDetails)
router.post("/getCategoryId",getCategoryId)




module.exports=router