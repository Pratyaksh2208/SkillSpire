const Course = require("../models/Course")
const Category = require("../models/Category")
const User = require("../models/User")
const { uploadImageToCloudinary } = require("../utils/imageUploader")

//createCourse handler function
exports.createCourse =async (req,res)=>  {
    try {

        //fetch data
        const {
            courseName,
            courseDescription,
            whatYouWillLearn,
            price,
           // tag: _tag,
            category,
           // status,
          //  instructions: _instructions,
          } = req.body
        // Get thumbnail image from request files
        const thumbnail = req.files.thumbnailImage

        //validiation
        if(!courseName || !courseDescription || !whatYouWillLern || !price || !tag || !thumbnail){
            return res.status.status(400).json({
                success:false,
                message:'All fields are required',
            });
        }

        // check for instructor
        const userId=req.user.id;
        const instructorDetails= await User.findById(userId);
        console.log("Instructor details", instructorDetails);
        //todo: verify that userid instructor id are
        
        if(!instructorDetails){
            return res.status(404).json({
                success:false,
                message:'Instructor Details not found',
            });
        }

        // Check if the categoryy given is valid
    const categoryDetails = await Category.findById(category)
    if (!categoryDetails) {
      return res.status(404).json({
        success: false,
        message: "Category Details Not Found",
      })
    }

    // Upload the Thumbnail to Cloudinary
    const thumbnailImage = await uploadImageToCloudinary(
        thumbnail,
        process.env.FOLDER_NAME
      );
      
   // Create a new course with the given details
      const newCourse = await Course.create({
        courseName,
        courseDescription,
        instructor: instructorDetails._id,
        whatYouWillLearn: whatYouWillLearn,
        price,
       // tag,
        category: categoryDetails._id,
        thumbnail: thumbnailImage.secure_url,
      })

      //add the new course to the User Schema of Instructor
      await User.findByIdAndUpdate(
        {
          _id: instructorDetails._id,
        },
        {
          $push: {
            courses: newCourse._id,
          },
        },
        { new: true }
      )
      //update the Tag ka schema
      //to do:hw 
       // Add the new course to the Categories
    const categoryDetails2 = await Category.findByIdAndUpdate(
        { _id: category },
        {
          $push: {
            courses: newCourse._id,
          },
        },
        { new: true }
      )
      console.log("HEREEEEEEEE", categoryDetails2)
      //return response
      return res.status(200).json({
        success: true,
        data: newCourse,
        message: "Course Created Successfully",
    });
    } catch (error) {
        // Handle any errors that occur during the creation of the course
        console.error(error)
        res.status(500).json({
            success: false,
            message: "Failed to create course",
            error: error.message,
        })
    }


};

 





//getgetAllCourses handler function
// Get Course List
exports.showAllCourses = async (req, res) => {
    try {
        //todo : change the below staement incrementally
      const allCourses = await Course.find(
        { },
        {
          courseName: true,
          price: true,
          thumbnail: true,
          instructor: true,
          ratingAndReviews: true,
          studentsEnrolled: true,})
      .populate("instructor")
      .exec();
  
      return res.status(200).json({
        success: true,
        data: allCourses,
        message:'Data for all courses fetched successfully'
      })
    } catch (error) {
      console.log(error)
      return res.status(404).json({
        success: false,
        message: `Can't Fetch Course Data`,
        error: error.message,
      })
    }
  }



// get course details :
exports.getFullCourseDetails = async (req, res) => {
    try {
    //get id
      const { courseId } = req.body
      const courseDetails = await Course.find({
        _id: courseId,
      })
        .populate({
          path: "instructor",
          populate: {
            path: "additionalDetails",
          },
        })
        .populate("category")
        .populate("ratingAndReviews")
        .populate({
          path: "courseContent",
          populate: {
            path: "subSection",
          },
        })
        .exec()

    // validation
      if (!courseDetails) {
        return res.status(400).json({
          success: false,
          message: `Could not find course with id: ${courseId}`,
        });
      }
  
     
        
      
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
}


