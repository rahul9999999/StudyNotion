const express =require("express")
const app=express()
const cookieParser=require("cookie-parser")
const fileUpload=require("express-fileupload")
const dbConnect = require("./config/dataBase")
const { cloudinaryConnect } = require("./config/cloudinary")
const auth=require("./routes/auth")
const profile=require("./routes/profile")
const category=require("./routes/category")
const course=require("./routes/course")
const ratingAndReview=require("./routes/ratingAndReview")
const section=require("./routes/section")
const subSection=require("./routes/subSection")
const resetPassword=require("./routes/resetPassword")
const contactUs=require("./routes/contactUs")
const payment=require("./routes/payment")
const cors = require("cors");



require("dotenv").config()
const PORT=process.env.PORT || 5000

const whitelist = process.env.CORS_ORIGIN
  ? JSON.parse(process.env.CORS_ORIGIN)
  : ["*"];


app.use(express.json())
app.use(cookieParser())
app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : '/tmp/'
}))
app.use(
    cors({
      origin: whitelist,
      credentials: true,
      maxAge: 14400,
    })
  );

dbConnect()
cloudinaryConnect()

app.use("/api/v1/auth",auth)
app.use("/api/v1/category",category)
app.use("/api/v1/course",course)
app.use("/api/v1/profile",profile)
app.use("/api/v1/resetpassword",resetPassword)
app.use("/api/v1/ratingandreviews",ratingAndReview)
app.use("/api/v1/section",section)
app.use("/api/v1/subSection",subSection)
app.use("/api/v1/contact",contactUs)
app.use("/api/v1/payment",payment)



app.listen(PORT,(req,res)=>{
    console.log(`Listening at Port ${PORT}`)
})



