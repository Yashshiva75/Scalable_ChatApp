import mongoose from "mongoose";

const userModel = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: function () {
        // agar googleId nahi hai to password required hoga
        return !this.googleId;
      },
    },
    profilePhoto: {
      type: String,
      default: "",
    },
    gender: {
      type: String,
      enum: ["male", "female"],
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // allow multiple docs with undefined googleId
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("user", userModel);
