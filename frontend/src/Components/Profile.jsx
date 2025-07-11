import React, { useState } from 'react';
import { Camera, Edit3, Heart, MessageCircle, Users, Check, X } from 'lucide-react';
import { MoveLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate()

  const [profile, setProfile] = useState({
    name: 'Alex Johnson',
    age: '24',
    status: 'Always ready for new adventures! 🌟',
    profilePicture: null,
    joinDate: 'March 2024',
    friendsCount: 127,
    chatsCount: 89
  });

  const [editProfile, setEditProfile] = useState({ ...profile });

  const handleEdit = () => {
    setIsEditing(true);
    setEditProfile({ ...profile });
  };

  const handleSave = () => {
    setProfile({ ...editProfile });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditProfile({ ...profile });
    setIsEditing(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (isEditing) {
          setEditProfile({ ...editProfile, profilePicture: e.target.result });
        } else {
          setProfile({ ...profile, profilePicture: e.target.result });
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
    "Custom status..."
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button className='btn btn-outline btn-info'
          onClick={()=>navigate('/chat')}
          >
            <MoveLeft />
            Back</button>
          <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100"
            >
              <Edit3 size={16} className="text-blue-500" />
              <span className="text-sm font-medium text-gray-700">Edit</span>
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex items-center gap-1 bg-green-500 px-3 py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-300 text-white"
              >
                <Check size={14} />
                <span className="text-sm font-medium">Save</span>
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-1 bg-gray-500 px-3 py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-300 text-white"
              >
                <X size={14} />
                <span className="text-sm font-medium">Cancel</span>
              </button>
            </div>
          )}
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-6 border border-gray-100">
          {/* Profile Picture */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-lg overflow-hidden">
                {(isEditing ? editProfile.profilePicture : profile.profilePicture) ? (
                  <img
                    src={isEditing ? editProfile.profilePicture : profile.profilePicture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-white">
                    {(isEditing ? editProfile.name : profile.name).split(' ').map(n => n[0]).join('')}
                  </span>
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-50 transition-colors duration-200 border border-gray-200">
                <Camera size={16} className="text-gray-600" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Profile Info */}
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editProfile.name}
                  onChange={(e) => setEditProfile({ ...editProfile, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your name"
                />
              ) : (
                <div className="text-xl font-semibold text-gray-800 px-4 py-3 bg-gray-50 rounded-2xl">
                  {profile.name}
                </div>
              )}
            </div>

            {/* Age */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Age</label>
              {isEditing ? (
                <input
                  type="number"
                  value={editProfile.age}
                  onChange={(e) => setEditProfile({ ...editProfile, age: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your age"
                  min="13"
                  max="100"
                />
              ) : (
                <div className="text-lg text-gray-800 px-4 py-3 bg-gray-50 rounded-2xl">
                  {profile.age} years old
                </div>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Status</label>
              {isEditing ? (
                <div className="space-y-2">
                  <select
                    value={editProfile.status}
                    onChange={(e) => setEditProfile({ ...editProfile, status: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    {statusOptions.map((option, index) => (
                      <option key={index} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  {editProfile.status === "Custom status..." && (
                    <input
                      type="text"
                      value={editProfile.customStatus || ''}
                      onChange={(e) => setEditProfile({ ...editProfile, status: e.target.value })}
                      placeholder="Enter your custom status"
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  )}
                </div>
              ) : (
                <div className="text-gray-700 px-4 py-3 bg-gray-50 rounded-2xl">
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