const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");

const OTPSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
	},
	otp: {
		type: String,
		required: true,
	},
	createdAt: {
		type: Date,
		default: Date.now(),
		expires: 60 * 5, // The document will be automatically deleted after 5 minutes of its creation time
	}
});

// Defining a function to send emails
async function sendVerificationEmail(email, otp) {
	 
	try {
		const mailResponse = await mailSender(
			email,
			"Verification Email",
			otp
		);
		console.log("Email sent successfully: ", mailResponse);
	} catch (error) {
		console.log("Error occurred while sending email: ", error);
		throw error;
	}
}

// Define a post-save hook to send email after the document has been saved
OTPSchema.pre("save", async function (next) {
	await sendVerificationEmail(this.email, this.otp);
	next();
});

module.exports = mongoose.model("OTP", OTPSchema);