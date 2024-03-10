const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const mailSender = require("../utils/mailSender");

//sendOTP
exports.sendotp = async(req,res) => {

    try{
        const {email} = req.body;

        const checkUserPresent = await User.findOne({email});
        if(checkUserPresent){
            return res.status(401).json({
            success:false,
            message:'User already registered',
            })
        }
        
        //generate otp
        var otp = otpGenerator.generate(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
        });
        console.log("OTP hemerated",otp);

        //CHECKING UNIQUE OTP
        const result = await OTP.findOne({otp:otp});
        while(result){
            otp = otpGenerator(6,{
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                specialChars:false,
            });
            result = await OTP.findOne({otp:otp});
        }

        const otpPayload = {email,otp};

        const otpBody = await OTP.create(otpPayload);
        console.log(otpBody);

        res.status(200).json({
            success:true,
            message:'OTP sent successfully',
            otp,
        })

    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
    
};

//SignUP
exports.signup = async(req,res) => {

    try{
        //data fetch
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp,
        } = req.body;

        //validate
        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp){
            return res.status(403).send({
              success: false,
              message: "All Fields are required",
            })
        }

        //2 password match karenge
        if (password !== confirmPassword) {
            return res.status(400).json({
              success: false,
              message:
                'Password and Confirm Password do not match. Please try again.',
            })
        }

        //check if user already exist or not
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({
            success: false,
            message: "User already exists",
            });
        }

        //find most recent otp for given email
        const recentOtp = await OTP.find({email}).sort({createdAt:-1}).limit(1);
        console.log(recentOtp);
        //validate otp
        if(recentOtp.length == 0){
            //OTP not found
            return res.status(400).json({
                success:false,
                message:'OTP not found',
            })
        } else if (otp !== recentOtp.otp) {
            // Invalid OTP
            return res.status(400).json({
                success: false,
                message: "The OTP is not valid",
            });
        }

        //hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null,
        })
        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password: hashedPassword,
            accountType: accountType,
            approved: approved,
            additionalDetails: profileDetails._id,
            image: "https://api.dicebear.com/5.x/initials/svg?=${firstname} ${lastName}",
        })

        return res.status(200).json({
            success: true,  
            user,
            message: "User registered successfully",
        })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"User cannot be registered. Please try again.",
        })
    }

}

//Login
exports.login = async (req, res) => {
    try {
      const { email, password } = req.body
  
      if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: `Please Fill up All the Required Fields`,
        })
      }
  
      // Finding user with provided email
      const user = await User.findOne({ email }).populate("additionalDetails")
  
      if (!user) {
        // Return 401 Unauthorized status code with error message
        return res.status(401).json({
          success: false,
          message: `User is not Registered with Us Please SignUp to Continue`,
        })
      }
  
      // Generate JWT token and Compare Password
      if (await bcrypt.compare(password, user.password)) {
        const payload = {
            email: user.email,
            id: user._id,
            role:user.accountType,
        }
        const token = jwt.sign(payload,process.env.JWT_SECRET,
            {
                expiresIn: "2h",
            }
        )
  
        // Save token to user document in database
        user.token = token
        user.password = undefined
        // Set cookie for token and return success response
        const options = {
          expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          httpOnly: true,
        }
        res.cookie("token", token, options).status(200).json({
          success: true,
          token,
          user,
          message: `Logged In successfully`,
        })
      } 
      else {
        return res.status(401).json({
          success: false,
          message: `Password is incorrect`,
        }); 
      }
    }
    catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            message: `Login Failure Please Try Again`,
        })
    }
}

//Change Password
exports.changePassword = async (req, res) => {
    try {
      const userDetails = await User.findById(req.user.id)
  
      const { oldPassword, newPassword } = req.body
  
      // Validating old password
      const isPasswordMatch = await bcrypt.compare(
        oldPassword,
        userDetails.password
      )
      if (!isPasswordMatch) {
        return res
          .status(401)
          .json({ success: false, message: "The password is incorrect" })
      }
  
      // Updating password
      const encryptedPassword = await bcrypt.hash(newPassword, 10)
      const updatedUserDetails = await User.findByIdAndUpdate(
        req.user.id,
        { password: encryptedPassword },
        { new: true }
      )
  
      // Send notification email
      try {
        const emailResponse = await mailSender(
          updatedUserDetails.email,
          "Password for your account has been updated",
          passwordUpdated(
            updatedUserDetails.email,
            `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
          )
        )
        console.log("Email sent successfully:", emailResponse.response)
      } catch (error) {
        console.error("Error occurred while sending email:", error)
        return res.status(500).json({
          success: false,
          message: "Error occurred while sending email",
          error: error.message,
        })
      }
  
      return res
        .status(200)
        .json({ success: true, message: "Password updated successfully" })
    } catch (error) {
      console.error("Error occurred while updating password:", error)
      return res.status(500).json({
        success: false,
        message: "Error occurred while updating password",
        error: error.message,
      })
    }
  }