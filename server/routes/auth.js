const express=require("express")
const { sendOtp, signUp, logIn, checkAuth, changePassword } = require("../controllers/auth")
const { auth } = require("../middlewares/auth")
const router=express.Router()
const {isDemo} =require("../middlewares/demo")


router.post("/sendotp",sendOtp)
router.post("/signup",signUp)
router.post("/login",logIn)
router.post("/checkAuthentication",auth,checkAuth)
router.post("/changepassword", auth,isDemo,changePassword)

module.exports=router