
const categoryModel = require("../models/category")

exports.createCategory = async (req, res) => {
    try {
        const { name, description } = req.body
        if (!name || !description) {
            return res.status(400).json({
                success: false,
                message: "Please Fill the details properly"
            })
        }

        const newCategory = await categoryModel.create({
            name,
            description
        })

        res.status(200).json({
            success: true,
            message: "Category created Successfully"
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            error: error.message,
            message: "Something went wrong while creating category"
        })

    }

}

exports.showAllCategories = async (req, res,next) => {
    try {
        const category = await categoryModel.find({})
        if (!category) {
            return res.status(400).json({
                success: false,
                message: "No Category Found"
            })
        }

       

        res.status(200).json({
            success: true,
            category,
            message: "Category find Successfully"
        })
        

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            error: error.message,
            message: "Something went wrong while fetching category "
        })

    }
}

exports.categoryPageDetails = async (req, res) => {
    try {
        const { categoryId } = req.body
       
        if (!categoryId) {
            return res.status(404).json({
                success: true,
                message: "Id not found ,please give details correctly"
            })
        }

        const specificCategory = await categoryModel.findById(categoryId).populate({path:"courses",match:{status:"Published"},populate:([{path:"instructor"},{path:"ratingAndReviews"}])});
        if (!specificCategory) {
            return res.status(404).json({
                success: true,
                message: "category Not found"
            })
        }

        const categoriesExceptSelected = await categoryModel.find({
			_id: { $ne: categoryId },
		}).populate({path:"courses",match:{status:"Published"},populate:([{path:"instructor"},{path:"ratingAndReviews"}])});
		let differentCourses = [];
		for (const category of categoriesExceptSelected) {
			differentCourses.push(...category.courses);
		}

        const allCategories = await categoryModel.find().populate({path:"courses",match:{status:"Published"},populate:([{path:"instructor"},{path:"ratingAndReviews"}])});
        
		const allCourses = allCategories.flatMap((category) => category.courses);
       
		const mostSellingCourses = allCourses
			.sort((a, b) => b.sold - a.sold)
			.slice(0, 10);
            

        res.status(200).json({
            success: true,
            message: "Category fetched",
            data: {
                specificCategory,
                differentCategories:differentCourses,
                mostSellingCourses
            }
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            error: error.message,
            message: "Something went wrong while fetching category "
        })


    }
}

exports.getCategoryId = async(req,res)=>{
    try{
        const {name} = req.body
       
        if(!name){
            return res.status(500).json({
                success:false,
                message:"Please fill details correctly"
            })
        }
        const result=await categoryModel.find({name})
        return res.status(200).json({
            success:true,
            result
        })
    }catch(err){
        return res.status(500).json({
            success:false,
            message:err.message,
            err
        })
    }
}