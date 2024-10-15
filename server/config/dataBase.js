const mongoose=require("mongoose")
require("dotenv").config()

const dbConnect=()=>{
    mongoose.connect(process.env.MONGO_URL).
    then(()=>{console.log("Database Connected Successfully")}).
    catch((error)=>{console.log(error)
    console.log("Database Not Connected")})
}
module.exports=dbConnect