const express =require("express")
const { capturePayment, veryfingPayment, sendPaymentSuccessEmail } = require("../controllers/payment")
const { auth, isStudent } = require("../middlewares/auth")
const router=express.Router()

router.post("/capturePayment",auth,isStudent,capturePayment)
router.post("/verifyPayment",auth,veryfingPayment)
router.post("/sendPaymentSuccessEmail",auth,sendPaymentSuccessEmail)

module.exports=router