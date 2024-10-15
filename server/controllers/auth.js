const UserModel = require("../models/user")
const OTP = require("otp-generator")
const OtpModel = require("../models/otp")
const ProfileModel = require("../models/profile")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const sendMail = require("../utils/sendMail")
const { passwordUpdated } = require("../mail/templates/passwordUpdate")
require("dotenv").config()


// SEND_OTP
exports.sendOtp = async (req, res) => {
    try {
        const { email } = req.body
        const user = await UserModel.findOne({ email })

        if (user) {
            return res.status(400).json({
                success: false,
                message: "User is Already Registered"
            })
        }

        const otp = OTP.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false
        })
        const result = await OtpModel.findOne({ otp })

        while (result) {
            otp = OTP.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false
            })
            result = await OtpModel.findOne({ otp })
        }
        const newOtp = await OtpModel.create({ email, otp })

        return res.status(200).json({
            success: true,
            newOtp,
            message: "Otp send successfully"
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            error: error.message,
            message: "Something went wrong while sending otp"
        })

    }

}

// SIGN_UP
exports.signUp = async (req, res) => {
    try {
        const { firstName, lastName, password, email, confirmPassword, otp, accountType } = req.body

        if (!firstName || !lastName || !password || !email || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Invalid details,plaese give the details correctly"
            })
        }

        const userExists = await UserModel.findOne({ email })
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            })
        }

        if (password !== confirmPassword) {
            return res.status(401).json({
                success: false,
                message: "Password dosesn't matched "
            })
        }

        const recentOtp = await OtpModel.findOne({ email }).sort({ createdAt: -1 }).limit(1)

        if (!recentOtp) {
            return res.status(401).json({
                success: false,
                message: "Invalid Otp"
            })
        }
        else if (otp !== recentOtp.otp) {
            return res.status(400).json({
                success: false,
                message: "Otp dosen't matched"
            })
        }

        const createProfile = await ProfileModel.create({
            gender: null,
            about: null,
            dateOfBirth: null,
            contactNumber: null
        })

        const hashPassword = await bcrypt.hash(password, 10)

        const createUser = await UserModel.create({
            firstName,
            lastName,
            password: hashPassword,
            email,
            additionalDetails: createProfile._id,
            image: `https://api.dicebear.com/6.x/initials/svg?seed=${firstName} ${lastName}&backgroundColor=00897b,00acc1,039be5,1e88e5,3949ab,43a047,5e35b1,7cb342,8e24aa,c0ca33,d81b60,e53935,f4511e,fb8c00,fdd835,ffb300,ffd5dc,ffdfbf,c0aede,d1d4f9,b6e3f4&backgroundType=solid,gradientLinear&backgroundRotation=0,360,-350,-340,-330,-320&fontFamily=Arial&fontWeight=600`,
            accountType
        })

        return res.status(200).json({
            success: true,
            createUser,
            message: "User created Successfully"
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            error: error.message,
            message: "Something went wrong while creating user"
        })
    }

}

// LOG_IN
exports.logIn = async (req, res) => {
    try {
        const { email, password } = req.body

        const user = await UserModel.findOne({ email }).populate("coursesInProgress").populate("additionalDetails");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid Credentials"
            })
        }

        if (await bcrypt.compare(password, user.password)) {
            const payload = {
                id: user._id,
                email: user.email,
                accountType:user.accountType,

            }

            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "3d"
            })

            const options={
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
				httpOnly: true,

            }
            res.cookie("token",token,options).status(200).json({
                success:true,
                token,
                user,
                message:"cookie created successfully"

            })

        }
        else{
            return res.status(401).json({
                success:false,
                message:"Password doesn't matched"
            })
        }

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success:false,
            error:error.message,
            message:"Something went wrong while login"
        })

    }





}

exports.checkAuth =async (req,res) =>{
    const {data} = req.body

    return res.status(200).json({
        success:true,
        data
    })
}

exports.changePassword = async (req, res) => {
	try {
		// Get user data from req.user
		const userDetails = await UserModel.findById(req.user.id);

		// Get old password, new password, and confirm new password from req.body
		const { oldPassword, newPassword, confirmNewPassword } = req.body;

		// Validate old password
		const isPasswordMatch = await bcrypt.compare(
			oldPassword,
			userDetails.password
		);
		if(oldPassword === newPassword){
			return res.status(400).json({
				success: false,
				message: "New Password cannot be same as Old Password",
			});
		}
		
		if (!isPasswordMatch) {
			// If old password does not match, return a 401 (Unauthorized) error
			return res
				.status(401)
				.json({ success: false, message: "The password is incorrect" });
		}

		// Match new password and confirm new password
		if (newPassword !== confirmNewPassword) {
			// If new password and confirm new password do not match, return a 400 (Bad Request) error
			return res.status(400).json({
				success: false,
				message: "The password and confirm password does not match",
			});
		}

		// Update password
		const encryptedPassword = await bcrypt.hash(newPassword, 10);
		const updatedUserDetails = await UserModel.findByIdAndUpdate(
			req.user.id,
			{ password: encryptedPassword },
			{ new: true }
		);

		// Send notification email
		try {
			const emailResponse = await sendMail(
				updatedUserDetails.email,
				"Study Notion - Password Updated",
				passwordUpdated(
					updatedUserDetails.email,
					`Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
				)
			);
			console.log("Email sent successfully:", emailResponse.response);
		} catch (error) {
			// If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
			console.error("Error occurred while sending email:", error);
			return res.status(500).json({
				success: false,
				message: "Error occurred while sending email",
				error: error.message,
			});
		}

		// Return success response
		return res
			.status(200)
			.json({ success: true, message: "Password updated successfully" });
	} catch (error) {
		// If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
		console.error("Error occurred while updating password:", error);
		return res.status(500).json({
			success: false,
			message: "Error occurred while updating password",
			error: error.message,
		});
	}
};

