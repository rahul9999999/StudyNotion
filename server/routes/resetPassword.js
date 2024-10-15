const express =require("express")
const { resetPasswordMail, resetPassword } = require("../controllers/resetPassword")
const router=express.Router()

router.post("/resetpasswordmail",resetPasswordMail)
router.put("/reset-password",resetPassword)

module.exports=router