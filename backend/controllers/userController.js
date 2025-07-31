import { User } from "../models/userSchema.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/generateToken.js";

export const register = async (req, res) => {
  try {
    const {
      fullName,
      userName,
      password,
      confirmpassword,
      profilePhoto,
      gender,
    } = req.body;

    if (!fullName || !userName || !password || !gender) {
      return res.status(500).json({ message: "All fields are necessary" });
    }

    if (password !== confirmpassword) {
      return res.status(500).json({ message: "Password must match" });
    }

    const user = await User.findOne({ userName });

    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const malePhoto = `https://avatar.iran.liara.run/public/boy`;
    const femalePhoto = "https://avatar.iran.liara.run/public/girl";

    const newUser = await User.create({
      fullName,
      userName,
      password: hashedPassword,
      profilePhoto: gender === "male" ? malePhoto : femalePhoto,
      gender,
    });

    //Generate JWT token
    const token = generateToken(newUser._id);

    res.cookie("jwt", token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    
    return res.status(200).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        userName: newUser.userName,
        profilePhoto: newUser.profilePhoto,
        gender: newUser.gender,
      },
    });
  } catch (error) {
    console.log('Error in redg',error)
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

//Login
export const Login = async (req, res) => {
  try {
    const { userName, password } = req.body;

    if (!userName || !password) {
      return res
        .status(400)
        .json({ message: "Please enter both fields properly" });
    }

    const user = await User.findOne({ userName });
    console.log('user come',user)
    if (!user) {
      return res.status(404).json({ message: "user not found please sign in" });
    }

    const passCheck = await bcrypt.compare(password, user.password);

    if (!passCheck) {
      return res.status(404).json({ message: "Invalid password!" });
    }

    const token = generateToken(user._id);

    res.cookie("jwt", token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    console.log('token stored in cookies successfully but still issue)
    return res.status(200).json({
      message: "Login successfully",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        userName: user.userName,
        profilePhoto: user.profilePhoto,
        gender: user.gender,
      },
    });
  } catch (error) {
    console.log("Error", error);
    return res.status(500).json({ message: "Error in login api" });
  }
};

export const logout = async (req,res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    return res.status(200).json("logout Successfully");
  } catch (error) {
    return res.status(500).json("logout Error");
  }
};

export const getOtherUsers = async (req, res) => {
  
  try {
    const LoggedInUser = req.user;

    const AllUsers = await User.find({ _id: { $ne: LoggedInUser } }).select(
      "-password"
    );
    
    return res.status(200).json({ users: AllUsers });
  } catch (error) {
    return res.status(500).json("Error in getting users");
  }
};

//Edit profile
export const editUserProfile = async(req,res)=>{
  
  try{
      const userId = req.user;
      const {userName} = req.body;
      const profilePicture = req.file?.path; // Cloudinary gives file URL in `path`
      
      const updatedUser = await User.findByIdAndUpdate(userId,{
        userName:userName,
        profilePhoto:profilePicture
      },
    {new:true}
    )

    if(!updatedUser){
      return res.status(404).json({message:'User not found or error in updating'})
    }
    console.log('updateduser',updatedUser)
    return res.status(200).json({user:updatedUser,message:'user details updated successfully'})

  }catch(error){
    console.log('Error in update profile',error)
        return res.status(500).json({message:'Error in api'})

  }
}

//Login wid google
export const registerWithGoogle = async (req, res) => {
  try {
    const { name,picture,sub } = req.body;
    if (!name || !sub || !picture) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists with same googleId or userName
    let existingUser = await User.findOne({ googleId:sub });

    if (!existingUser) {
      existingUser = await User.findOne({ userName:name });
    }

    if (existingUser) {
      // If user already exists, return token directly
      const token = generateToken(existingUser._id);

      res.cookie("jwt", token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

      return res.status(200).json({
        message: "User already exists, logged in",
        token,
        user: {
          id: existingUser._id,
          fullName: existingUser.fullName,
          userName: existingUser.userName,
          profilePhoto: existingUser.profilePhoto,
        },
      });
    }

    // Create new user
    const newUser = await User.create({
      fullName:name,
      userName:name,
      profilePhoto:picture,
      googleId:sub,
    });

    const token = generateToken(newUser._id);

     res.cookie("jwt", token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      message: "User registered via Google",
      token,
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        userName: newUser.userName,
        profilePhoto: newUser.profilePhoto,
      },
    });
  } catch (error) {
    console.error("Google register error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
