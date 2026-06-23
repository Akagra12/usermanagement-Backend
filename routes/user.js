const express=require("express");
const router=express.Router();
const bcrypt=require("bcrypt");
const User=require("../models/user.js")
const jwt = require("jsonwebtoken");
const auth=require("../middleware/auth.js");
const isAdmin = require("../middleware/isAdmin.js");

router.post("/register",async (req,res) => {
    try{
        console.log(req.body);
        const{
            firstName,
            middleName,
            lastName,
            email,
            password,
            role,
        }=req.body;

        // check if user already exist
        const existingUser=await User.findOne({email});
        if(existingUser){
            return res.status(400).json({
                success:false,
                message:"user already exist",
            });
        }
//       hash password
        const hashedPassword=await bcrypt.hash(password,10);

        // create new user
        const user= await User.create({
            firstName,
            middleName,
            lastName,
            email,
            password: hashedPassword,
            role,
        });
        res.status(201).json({
            success:true,
            message:"all thinks work good",
            user,
        });

    }
    catch(error){
        console.error(error);
        res.status(500).json({
            success:false,
            message:error.message
        });
    }
});
router.post("/login", async (req, res) => {
  console.log(req.body);
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({
          success: false,
          // message: "Email does not exit",
          message:"Invalid email or password"
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          // message: "Invalid Password",
          message:"Invalid email or password"

        });
      }

      if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured");
      }

      const token = jwt.sign(
        {
          id: user._id,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" },
      );

      res.status(200).json({
        success: true,
        message: "Login Successful",
        user,
        token,
      });
    } catch (error) {
      console.error("Login Error:",error);

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
});
router.get("/infobyrole/:role",async (req,res) => {
    try{
        const role=req.params.role;
        const user=await User.find({role});
        if(!user){
            return res.status(404).json({
                success:false,
                message:"user not found",
            });
        }
        res.status(200).json({
            success:true,
            message:"all thinks work good",
            users:user,
        });
    }
    catch(error){
        res.status(500).json({
            success:false,
            message:"Internal server error",
        });
    }


});
router.get("/allusers", async (req, res) => {
  try {
    const users = await User.find();

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


router.get(
  "/profile",
  auth,
  async (req, res) => {
    try{
    const user =
      await User.findById(
        req.user.id
      );
    res.json({
      success: true,
      user,
    });

  }
  catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.delete("/delete/:id",auth, isAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "User deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.put("/update/:id", auth, isAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, {
      firstName:req.body.firstName,
    },
    {
      new: true,
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({
      message: error.message,
      user
    });
  }
});
router.put("/ProfileUpdate",auth,async (req,res) => {
  const userId = req.user.id;
  try{
      const user = await User.findByIdAndUpdate(userId, {
        firstName:req.body.firstName,
        lastName:req.body.lastName,
        email:req.body.email,
        // password:req.body.password,
      },
      {
        new:true,
      
        
      });
      res.json(user);
  }
  catch(error){
    res.status(500).json({
      message:error.message
    })  
  }
});

router.put(
  "/changePassword",
  auth,
  async (req, res) => {

    try {

      const user =
        await User.findById(
          req.user.id
        );

      const isMatch =
        await bcrypt.compare(
          req.body.oldPassword,
          user.password
        );

      if (!isMatch) {
        return res.status(400)
          .json({
            success: false,
            message:
              "Old password incorrect"
          });
      }

      const hashedPassword =
        await bcrypt.hash(
          req.body.newPassword,
          10
        );

      user.password =
        hashedPassword;

      await user.save();

      res.status(200).json({
        success: true,
        message:
          "Password Changed Successfully"
      });

    } catch (error) {

      res.status(500)
        .json({
          success: false,
          message:
            error.message
        });

    }
  }
);

module.exports=router;