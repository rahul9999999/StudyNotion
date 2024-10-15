const express =require("express")
const { createRating, getAvarageRating, getAllRating } = require("../controllers/ratingAndReviews")
const { auth, isStudent } = require("../middlewares/auth")
const router=express.Router()


router.post("/createrating",auth,isStudent,createRating)
router.get("/getavaragerating",getAvarageRating)
router.get("/getReviews",getAllRating)

module.exports=router