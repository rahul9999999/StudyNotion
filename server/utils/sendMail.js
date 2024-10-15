const nodemailer = require("nodemailer");
require("dotenv").config()

const sendMail=async (email,title,body)=>{
    try{
        const transporter = nodemailer.createTransport({
        host: process.env.SMPT_SERVICE,
        port: 465,
        secure: true,
        auth: {
            user: process.env.SMPT_MAIL,
            pass: process.env.SMPT_PASSWORD,
        },
        });
    
        let info = await transporter.sendMail({
            from: 'StudyNotion || Rahul_Kumar', 
            to: `${email}`, 
            subject:`${title}`, 
            html: `${body}`, 
          });

          console.log("info-> ",info)
        return info;
    
    }catch(error){
        console.log("Error While sending mail:->",error) 
    }

}
module.exports=sendMail
