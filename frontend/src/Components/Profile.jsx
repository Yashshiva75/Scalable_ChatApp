import React, { useState } from "react";
import { Camera, Edit3, Check, X, Loader2 } from "lucide-react";
import { MoveLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { userAPI } from "../Apis/userAPI";
import { setUser } from "../Store/userSlice";
import { showSuccessToast, showErrorToast } from "../utils/toasts/ReactToast";
import axios from "axios";

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false); // Add loading state
  const dispatch = useDispatch();
  const BASE_API = import.meta.env.VITE_REACT_APP_API_URL;

  const navigate = useNavigate();
  const loggedInUser = useSelector((state) => state.user.user);

  const [profile, setProfile] = useState({
    userName: loggedInUser?.userName?.toUpperCase(),
    status: "Always ready for new adventures! 🌟",
    profilePicture: loggedInUser?.profilePhoto,
    joinDate: "March 2024",
  });

  const [editProfile, setEditProfile] = useState({ ...profile });

  const handleEdit = () => {
    setIsEditing(true);
    setEditProfile({ ...profile });
  };

  const handleSave = async () => {
  setIsUpdating(true);
  console.log("final data going to save ", editProfile);
  try {
    setProfile({ ...editProfile });
    const formData = new FormData();
    formData.append("userName", editProfile.userName);

    if (editProfile.profilePictureFile instanceof File) {
     formData.append("profilePicture", editProfile.profilePictureFile);
    }    

    // Debug: Log FormData contents
    console.log("FormData contents:");
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(key, `[File: ${value.name}, ${value.size} bytes, ${value.type}]`);
      } else {
        console.log(key, value);
      }
    }
    
    const updatedUser = await updateprofile(formData);
     
    if (updatedUser && updatedUser?.data.user) {
      dispatch(setUser({ user: updatedUser?.data.user }));
      sessionStorage.setItem("user", JSON.stringify(updatedUser?.data.user));
      setIsEditing(false);
      showSuccessToast("Profile updated successfully!");
    } else {
      
      throw new Error("Failed to update profile",Error);
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    showErrorToast("Failed to update profile. Please try again.");
    setEditProfile({ ...profile });
  } finally {
    setIsUpdating(false);
  }
  };

  const handleCancel = () => {
    setEditProfile({ ...profile });
    setIsEditing(false);
  };

  // const handleImageUpload = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onload = (e) => {
  //       if (isEditing) {
  //         setEditProfile({ ...editProfile, profilePicture: e.target.result });
  //       } else {
  //         setProfile({ ...profile, profilePicture: e.target.result });
  //       }
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // };

  const handleImageUpload = (e) => {
  
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (isEditing) {
        setEditProfile({ 
          ...editProfile, 
          profilePicture: e.target.result, // Base64 URL for preview
          profilePictureFile: file // Original File object for upload
        });
      } else {
        setProfile({ 
          ...profile, 
          profilePicture: e.target.result,
          profilePictureFile: file
        });
      }
    };
    reader.readAsDataURL(file);
  }
};

  const statusOptions = [
    "Always ready for new adventures! 🌟",
    "Coffee lover ☕ | Book enthusiast 📚",
    "Exploring the world one chat at a time 🌍",
    "Making memories with amazing friends 💫",
    "Living life to the fullest! ✨",
    "Custom status...",
  ];

  const updateprofile = async (data) => {
  
  // Log FormData contents
  if (data instanceof FormData) {
    console.log("FormData entries:");
    for (let [key, value] of data.entries()) {
      if (value instanceof File) {
        console.log(`${key}: [File: ${value.name}, ${value.size} bytes, ${value.type}]`);
      } else {
        console.log(`${key}:`);
      }
    }
  } else {
    console.log("Raw data:", data);
  }
  
  try {
  
    const updateduser = await axios.put(`${BASE_API}/api/updateprofile`,data,{
      headers:{
        'Content-Type':'multipart/form-data',
      },
      withCredentials:true
    })
    console.log('updateduser',updateduser)
    return updateduser;
  } catch (error) {
    console.log("Error in updating", error);
    throw error;
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            className="btn btn-outline btn-info bg-slate-800 border-slate-600 text-cyan-400 hover:bg-slate-700 hover:border-cyan-400"
            onClick={() => navigate("/chat")}
            disabled={isUpdating} // Disable navigation during update
          >
            <MoveLeft />
            Back
          </button>
          <h1 className="text-2xl font-bold text-white">My Profile</h1>
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-600 hover:bg-slate-700"
              disabled={isUpdating}
            >
              <Edit3 size={16} className="text-cyan-400" />
              <span className="text-sm font-medium text-gray-200">Edit</span>
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex items-center gap-1 bg-green-600 px-3 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-white hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span className="text-sm font-medium">Saving...</span>
                  </>
                ) : (
                  <>
                    <Check size={14} />
                    <span className="text-sm font-medium">Save</span>
                  </>
                )}
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-1 bg-slate-600 px-3 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-white hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isUpdating}
              >
                <X size={14} />
                <span className="text-sm font-medium">Cancel</span>
              </button>
            </div>
          )}
        </div>

        {/* Loading Overlay */}
        {isUpdating && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-2xl p-6 flex flex-col items-center gap-4 border border-slate-700">
              <Loader2 size={32} className="animate-spin text-cyan-400" />
              <p className="text-white font-medium">Updating Profile...</p>
              <p className="text-gray-400 text-sm">Please wait</p>
            </div>
          </div>
        )}

        {/* Profile Card */}
        <div
          className={`bg-slate-800 rounded-3xl shadow-2xl p-8 mb-6 border border-slate-700 backdrop-blur-sm ${
            isUpdating ? "" : ""
          }`}
        >
          {/* Profile Picture */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg overflow-hidden ring-4 ring-slate-700">
                {(
                  isEditing
                    ? editProfile.profilePicture
                    : profile.profilePicture
                ) ? (
                  <img
                    src={
                      isEditing
                        ? editProfile.profilePicture
                        : profile.profilePicture
                    }
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-white">
                    {(isEditing ? editProfile.fullName : profile.fullName)
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                )}
              </div>
              <label
                className={`absolute bottom-0 right-0 bg-slate-700 rounded-full p-2 shadow-lg cursor-pointer hover:bg-slate-600 transition-colors duration-200 border border-slate-600 ${
                  isUpdating ? "pointer-events-none opacity-50" : ""
                }`}
              >
                <Camera size={16} className="text-cyan-400" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={isUpdating}
                />
              </label>
            </div>
          </div>

          {/* Profile Info */}
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editProfile.userName}
                  onChange={(e) =>
                    setEditProfile({ ...editProfile, userName: e.target.value })
                  }
                  className="w-full px-4 py-3 border text-gray-200 bg-slate-700 border-slate-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter your name"
                  disabled={isUpdating}
                />
              ) : (
                <div className="text-xl font-semibold text-white px-4 py-3 bg-slate-700 rounded-2xl border border-slate-600">
                  {profile?.userName}
                </div>
              )}
            </div>

            {/* Age */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Age
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={editProfile.age}
                  onChange={(e) =>
                    setEditProfile({ ...editProfile, age: e.target.value })
                  }
                  className="w-full px-4 py-3 border text-gray-200 bg-slate-700 border-slate-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter your age"
                  min="13"
                  max="100"
                  disabled={isUpdating}
                />
              ) : (
                <div className="text-lg text-gray-200 px-4 py-3 bg-slate-700 rounded-2xl border border-slate-600">
                  IMMORTALL!! years old
                </div>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              {isEditing ? (
                <div className="space-y-2">
                  <select
                    value={editProfile.status}
                    onChange={(e) =>
                      setEditProfile({ ...editProfile, status: e.target.value })
                    }
                    className="w-full px-4 py-3 border text-gray-200 bg-slate-700 border-slate-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isUpdating}
                  >
                    {statusOptions.map((option, index) => (
                      <option
                        key={index}
                        value={option}
                        className="bg-slate-700 text-gray-200"
                      >
                        {option}
                      </option>
                    ))}
                  </select>
                  {editProfile.status === "Custom status..." && (
                    <input
                      type="text"
                      value={editProfile.customStatus || ""}
                      onChange={(e) =>
                        setEditProfile({
                          ...editProfile,
                          status: e.target.value,
                        })
                      }
                      placeholder="Enter your custom status"
                      className="w-full px-4 py-3 text-gray-200 bg-slate-700 border border-slate-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isUpdating}
                    />
                  )}
                </div>
              ) : (
                <div className="text-gray-200 px-4 py-3 bg-slate-700 rounded-2xl border border-slate-600">
                  {profile.status}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
