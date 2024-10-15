
const UserModel = require("../models/user")
const sendMail = require("../utils/sendMail")
const bcrypt=require("bcrypt")
const crypto=require('crypto')

exports.resetPasswordMail = async (req, res) => {
    try {
        const { email } = req.body

        const userExists = await UserModel.findOne({ email })
        if (!userExists) {
            return res.status(400).json({
                success: false,
                message: "User Not resgistered"
            })
        }

        const token=crypto.randomBytes(20).toString("hex")
        
        const setToken=await UserModel.findOneAndUpdate({email},{token,tokenExpires:Date.now() + 3600000},{new:true})
        
        const url=`http://localhost:3000/reset-password/${token}`
        
        await sendMail(email,"Password Reset Link",`Your Link for email varification is ${url}. Please click this url to reset your password.`)

        res.status(200).json({
            success:true,
            setToken,
            message:"Reset Mail Send To your mail successfully"
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success:false,
            error:error.message,
            message:"Something went wrong while sending reset mail"
        })

    }
}

exports.resetPassword=async(req,res)=>{
    try{
    const{password,confirmPassword,token}=req.body

    if(password!==confirmPassword){
        return res.status(400).json({
            success:false,
            message:"Password and Confirm password doesn't matched"
        })
    }


    const tokenExists=await UserModel.findOne({token})
   
    if(!tokenExists){
        return res.status(401).json({
            success:false,
            message:"Token Not Valid"
        })
    }
    if(tokenExists.tokenExpires<Date.now()){
        return res.status(401).json({
            success:false,
            message:"Token expires"
        })
    }

    const hashPassword=await bcrypt.hash(password,10)

    const updatePassword=await UserModel.findOneAndUpdate({token},{password:hashPassword},{new:true})
    console.log("updatePass->", updatePassword)

    return res.status(200).json({
        success:true,
        updatePassword,
        message:"Password updated Successfully"
    })
}catch(error){
    console.log(error)
    return res.status(500).json({
        success:false,
        message:"Something went wrong while reseting the password"
    })
}



}
