const jwt= require("jsonwebtoken");
const User = require("../Models/User");


//Middleware to protect route
const protect = async (req , res , next) => {
    try{

        let token = req.headers.authorization;

        if(token && token.startsWith("Bearer")) {
            token = token.split(" ")[1]; // Extract token
            const decoded = jwt.verify(token , process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select("-password");
            if (!req.user) {
                return res.status(401).json({ message: "User not found" });
            }
            next();
        } else{
            console.error("🔥 No token provided");
            console.log("Heloo");
            res.status(401).json({message : "Not authorised , no token"});
        }

    } catch(error) {
        // console.log("Hii");
        // console.error("🔥 Server Error:", error.message);
        // res.status(401).json({message:"Token failed" , error:error.message});
        console.log("Erednkck'xz ")
        console.error("🔥 Backend Error:", err.message);
  res.status(500).json({ success: false, message: "Server Error", error: err.message });
    }
};

module.exports= {protect};