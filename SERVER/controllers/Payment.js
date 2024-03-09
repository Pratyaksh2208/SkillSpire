const { instance } = require("../config/razorpay")
const Course = require("../models/Course")
const User = require("../models/User")
const mailSender = require("../utils/mailSender")
const {courseEnrollmentEmail} = require("../mail/templates/courseEnrollmentEmail")
exports.capturePayment = async (req, res) => {
    //get course id and user id 
    const {course_id} = req.body;
    const userId = req.user.id;
    //validiation
    //valid course_id
    if(!course_id){
        return res.json({
            success:false,
            message:'Please provide valid course ID',
        })
    };
    //valid courseDetail
    let course;
    try {
        // Find the course by its ID
        course = await Course.findById(course_id)
  
        // If the course is not found, return an error
        if (!course) {
          return res
            .status(200)
            .json({ success: false, message: "Could not find the Course" });
        }
  
        // Check if the user is already enrolled in the course
        const uid = new mongoose.Types.ObjectId(userId);
        if (course.studentsEnroled.includes(uid)) {
          return res.status(200).json({ success: false, message: "Student is already Enrolled",
         });
        }
    }
    catch(error){
        console.error(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
    //order create
        const amount=course.price;
        const currency="INR";

        const options = {
            amount: amount * 100,
            currency,
            receipt: Math.random(Date.now()).toString(),
            notes:{
                courseID: course_id,
                iserId,
            }
          };

    try {
            // Initiate the payment using Razorpay
            const paymentResponse = await instance.orders.create(options)
            console.log(paymentResponse);
            //return response
            res.status(200).json({
                success: true,
                courseName: courseEnrollmentEmail.courseName,
                courseDescription: course.courseDescription,
                thumbnail: course.thumbnail,
                orserId: paymentResponse.id,
                currency: paymentResponse.currency,
                amount: paymentResponse.amount,
            });
    }
    catch (error) {
            console.log(error)
            res.status(500)
                .json({
                success: false,
                message: "Could not initiate order.",
                });
    }
    
};

//verify signature of Razorpay and Server
exports.verifySignature = async (req,res)=>{
    const webhookSecret= "12345678";

    const signature =req.headers ["x-razorpay-signature"];

    const shasum =crypto.createHmac("sha256",webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest= shasum.digest("hex");

    if(signature==digest){
        console.log("Payment is Authorised");

        const {courseId, userId}=req.body.payload.payment.entity.notes;

        try{
                //fulfill the action
                //find the course and enroll the student in it
                const enrolledCourse= await Course.findOneAndUpdate(
                                                {_id: courseId},
                                                {$push:{studentsEnrolled: userId}},
                                                {new:true},
                );
                if(!enrolledCourse){
                    return res.status(500).json({
                        success:false,
                        message:'Course not Found',
                    });

                }
                console.log(enrolledCourse);

                //find the student and add the course to their list enrolled course me
                const enrolledStudent= await User.findOneAndUpdate(
                                                {_id: userID},
                                                {$push:{courses:courseId}},
                                                {new:true},

                );
                console.log(enrolledStudent);

                //mai sending to student for confirmation
                const emailResponse= await mailSender(
                                            enrolledStudent.email,
                                            "congratulations from SkillSpire",
                                            "congratulations, you are enrolled into SkillSpire Course",
                );
                console.log(emailResponse);
                return res.status(200).json({
                    success:true,
                    message:"Signature Verified and Course Added",
                });

        }
        catch(error){
            console.log(error);
            return res.status(500).json({
                success:false,
                message:'Invalid request',
            })
        }
    }
    else{
        return res.status(400).json({
            success:false,
            message:'Invalid request',
        })
    }
}



   