const Category = require("../models/Category");

//create Tag ka handler function

exports.createCategory = async (req, res) => {
	try {
        //fetch data
		const { name, description } = req.body;
        //validiation
		if (!name) {
			return res
				.status(400)
				.json({ success: false, message: "All fields are required" });
		}
        // create entry in DB
		const CategorysDetails = await Category.create({
			name: name,
			description: description,
		});
		console.log(CategorysDetails);
        //return response
		return res.status(200).json({
			success: true,
			message: "Categorys Created Successfully",
		});
	} catch (error) {
		return res.status(500).json({
			success: true,
			message: error.message,
		});
	}
};


// getAlltags handler function
exports.showAllCategories = async (req, res) => {
	try {
        console.log("INSIDE SHOW ALL CATEGORIES");
		const allCategorys = await Category.find({},{name:true,description:true});
		res.status(200).json({
			success: true,
            message:'all categories return successfully',
			data: allCategorys,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};


//categoryPageDetails 

exports.categoryPageDetails = async (req, res) => {
    try {
       //Get category Id
      const { categoryId } = req.body
     // console.log("PRINTING CATEGORY ID: ", categoryId);
      // Get courses for the specified category
      const selectedCategory = await Category.findById(categoryId)
        .populate("courses")
        .exec();

      // Handle the case when the category is not found
      if (!selectedCategory) {
        console.log("Category not found.")
        return res
          .status(404)
          .json({ success: false, message: "Data not found" })
      }
     /* // Handle the case when there are no courses
      if (selectedCategory.courses.length === 0) {
        console.log("No courses found for the selected category.")
        return res.status(404).json({
          success: false,
          message: "No courses found for the selected category.",
        })
      }*/
  
      // Get courses for other categories
      const categoriesExceptSelected = await Category.find({
                                    _id: { $ne: categoryId },
                                    })
                                    .populate("courses")
                                    .exec();
    /*  // Get top-selling courses across all categories
      const allCategories = await Category.find()
        .populate({
          path: "courses",
          match: { status: "Published" },
          populate: {
            path: "instructor",
        },
        })
        .exec()
      const allCourses = allCategories.flatMap((category) => category.courses)
      const mostSellingCourses = allCourses
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 10)
       // console.log("mostSellingCourses COURSE", mostSellingCourses)*/
       //return response
      return res.status(200).json({
        success: true,
        data: {
          selectedCategory,
          differentCategory,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
    }
}

