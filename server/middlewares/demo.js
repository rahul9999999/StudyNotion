exports.isDemo = async (req, res, next)=> {
    console.log(req.user.email);
    if (req.user.email === "sanjuktapanda416@gmail.com" || req.user.email === "rahulkumarpanda999@gmail.com") {
        return res.status(401).json({
            success: false,
            message: "This is a Demo User",
        });
    }
    next();
}