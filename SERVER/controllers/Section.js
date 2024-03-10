const Section = require("../models/Section");
const Course = require("../models/Course");

exports.createSection = async(req,res) => {
    try{
        const {sectionName,courseId} = req.body;

        if(!sectionName || !courseId){
           return res.status(400).json({
            success:false,
            message:'Missing Properties',
           });
        }

        const newSection = await Section.create({ sectionName });

		// Adding the new section to the course's content array
		const updatedCourseDetails = await Course.findByIdAndUpdate(
			courseId,
			{
				$push: {
					courseContent: newSection._id,
				},
			},
			{ new: true }
		)
			.populate({
				path: "courseContent",
				populate: {
					path: "subSection",
				},
			})
			.exec();

		// Return the updated course object in the response
		return res.status(200).json({
			success: true,
			message: "Section created successfully",
			updatedCourseDetails,
		})
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:'Unable to create section again',
            error:error.message,
        });
    }
}

// Updating a section
exports.updateSection = async (req, res) => {
	try {
		const { sectionName, sectionId } = req.body;
        if(!sectionName || !sectionId){
            return res.status(400).json({
                success:false,
                message:'Missing Properties',
            });
        }
		const section = await Section.findByIdAndUpdate(sectionId,{ sectionName },{ new: true });

		return res.status(200).json({
			success: true,
			message: 'section updated successfully'
		});
	} 
    catch (error) {
		return res.status(500).json({
			success: false,
			message: "Unable to update section",
            error:error.message,
		});
	}
};

// DELETE a section
exports.deleteSection = async (req, res) => {
	try {
		const { sectionId,courseId } = req.body;
		await Section.findByIdAndDelete(sectionId);
		const updatedCourse = await Course.findById(courseId).populate({ path: "courseContent", populate: { path: "subSection" } }).exec();
		res.status(200).json({
			success: true,
			message: "Section deleted",
			updatedCourse,
		});
	} catch (error) {
		console.error("Error deleting section:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};