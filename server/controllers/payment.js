const mongoose = require("mongoose")
const courseModel = require("../models/course")
const userModel = require("../models/user")
const sendMail = require("../utils/sendMail")
const { instance } = require("../config/razorpay")
const courseProgressModel = require("../models/courseProgress")
const { courseEnrollmentEmail } = require("../mail/templates/courseEnrollmentEmail")
const { paymentSuccessEmail } = require("../mail/templates/paymentSuccessEmail")
const crypto = require("crypto");


exports.capturePayment = async (req, res) => {
    //get courseId and UserID
    const {courses} = req.body;
    const userId = req.user.id;
    //validation
    //valid courseID
    try{
    if(courses.length === 0) {
        return res.json({
            success:false,
            message:'Please provide valid course ID',
        })
    };

    let totalAmount = 0;

    for(const course_id of courses){
        let course;
        // console.log("courseid=",course_id);
        try{
            course = await courseModel.findById(course_id);
            if(!course) {
                return res.json({
                    success:false,
                    message:'Could not find the course',
                });
            }
    
            //user already pay for the same course
            const uid = new mongoose.Types.ObjectId(userId);
            if(course.studentEnrolled.includes(uid)) {
                return res.status(200).json({
                    success:false,
                    message:'Student is already enrolled',
                });
            }
            totalAmount += course.price;
        }
        catch(error) {
            console.error(error);
            return res.status(500).json({
                success:false,
                message:error.message,
            });
        }
       
    }
        const options = {
            amount: totalAmount * 100,
            currency: "INR",
            receipt: Math.random(Date.now()).toString(),
        };

        try{
            //initiate the payment using razorpay
            const paymentResponse = await instance.orders.create(options);
            console.log("payment",paymentResponse);
            //return response
            return res.status(200).json({
                success:true,
                orderId: paymentResponse.id,
                currency:paymentResponse.currency,
                amount:paymentResponse.amount,
            });
        }
        catch(error) {
            console.error(error);
            return res.status(500).json({
                success:false,
                message:error.message,
            });
        }
    }
    catch(error) {
        console.error(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
    
};

exports.veryfingPayment = async (req, res) => {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body
    const {courses} = req.body
    const userId = req.user.id

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
        return res.status(400).json({
            success: false,
            message: 'Payment details are incompleted'
        })
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id

    const enrolleStudent = async (courses) => {
        if (courses.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Course Id not found"
            })
        }

        try {
            for (let courseId of courses) {
                const course = await courseModel.findById(courseId)

                if (!course) {
                    return res.status(400).json({
                        success: false,
                        message: "Course not found"
                    })
                }

                const updateCouse = await courseModel.findByIdAndUpdate(courseId, { $push: { studentEnrolled: userId } }, { new: true })

                const updateUser = await userModel.findByIdAndUpdate(userId, { $push: { courses: courseId } }, { new: true })

                const progress = await courseProgressModel.create({
                    courseID: courseId,
                    userID: userId
                })

                await userModel.findByIdAndUpdate(userId, { $push: { coursesInProgress: progress._id } }, { new: true })

                const user = await userModel.findById(userId)
                const courseName = course?.courseName
                const userName = user?.firstName + user?.lastName
                const emailTemplet = courseEnrollmentEmail(courseName, userName)
                await sendMail(
                    user?.email,
                    `You have successfully enrolled for ${courseName}`,
                    emailTemplet)
            }
            return res.status(200).json({
                success: true,
                message: "payment successfull"
            })
        } catch {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    try {
         //verify the signature
         const generatedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET).update(body.toString()).digest("hex");
         if(generatedSignature === razorpay_signature) {
             await enrolleStudent(courses);
         }


    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

exports.sendPaymentSuccessEmail = async (req, res) => {
    const { amount, orderId, paymentId } = req.body
    const userId = req.user.id

    if (!orderId || !paymentId) {
        return res.status(400).json({
            success: false,
            message: "Payment details not found"
        })
    }
    try {
        const user = await userModel.findById(userId)
        const userName = user?.firstName
        const emailTemplet = paymentSuccessEmail(userName, amount/100, orderId, paymentId)

        await sendMail(user.email, "Payment Successfull", emailTemplet)
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Somthing went wrong while sending mail",
            error: error.message
        })
    }

}






