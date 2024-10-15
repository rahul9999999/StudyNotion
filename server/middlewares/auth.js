
const jwt = require("jsonwebtoken")
require("dotenv").config()

// AUTHENTICATION
exports.auth = async (req, res, next) => {
    try{
        //extract token
        const token = req.cookies.token
                        || req.body.token 
                        || req.header("Authorisation").replace("Bearer ", "");

                        console.log("token",token)

        //if token missing, then return response
        if(!token) {
            console.log("kk")
            return res.status(401).json({
                success:false,
                message:'Token is missing',
            });
        }

        //verify the token
        try{
            console.log("kk2")
            const decode =  jwt.verify(token, process.env.JWT_SECRET);
            console.log("decode= ",decode);
            req.user = decode;
           
        }
        catch(err) {
            return res.status(401).json({
                success:false,
                message:'token is invalid',
            });
        }
        next();
    }
    catch(error) {  
        return res.status(401).json({
            success:false,
            message:'Something went wrong while validating the token',
        });
    }
}

// IS_STUDENT
exports.isStudent = async (req, res, next) => {
    try {
        if (req.user.accountType !== "Student") {
            return res.status(401).json({
                success: false,
                message: "This is Protected route for student"
            })
        }
        next()
    } catch (error) {
        return res
            .status(500)
            .json({ success: false, message: `User Role Can't be Verified` });

    }
}

// IS_INSTRUCTER
exports.isInstructer = async (req, res, next) => {
    try {
        if (req.user.accountType !== "Instructer") {
            return res.status(401).json({
                success: false,
                message: "This is Protected route for Instructer"
            })
        }

        next()
    } catch (error) {
        return res
            .status(500)
            .json({ success: false, message: `User Role Can't be Verified` });
    }
}

// IS_ADMIN
exports.isAdmin = async (req, res, next) => {
    try {
        if (req.user.accountType !== "Admin") {
            return res.status(401).json({
                success: false,
                message: "This is Protected route for Admin"
            })
        }

        next()
    } catch (error) {
        return res
            .status(500)
            .json({ success: false, message: `User Role Can't be Verified` });
    }
}