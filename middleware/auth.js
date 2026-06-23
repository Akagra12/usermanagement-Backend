
// import jwt from "jsonwebtoken";
const jwt =require("jsonwebtoken")
const auth=(req,res,next)=>{
    const authHeader=req.headers.authorization;

    if(!authHeader){
        return res.status(401).json({
            success:false,
            message:"No tokens"
        });
    }
    const tokens=authHeader.split(" ")[1];
    try{
        const decoder=jwt.verify(tokens,process.env.JWT_SECRET);
        req.user=decoder;
        next();
    }catch(error){
        return res.status(401).json({
            success:false,
            message:"Invalid token"
        });
    }
};
module.exports=auth;