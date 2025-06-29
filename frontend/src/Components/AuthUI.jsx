import React, { useState } from "react";
import { authApi } from "../Apis/authApis";
import {useDispatch} from 'react-redux'
import { setUser } from "../Store/userSlice";
import { showSuccessToast,showErrorToast } from "../utils/toasts/ReactToast";
import { useNavigate } from "react-router-dom";

export default function AuthUI() {

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState("login");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmpassword: "",
    fullName: "",
    userName: "",
    gender: "",
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async () => {
    try {
      const apiCall = activeTab === 'register' ? authApi.register(formData) : authApi.login(formData);

      const response = await apiCall;
      
      console.log("response", response);
      if(response.token){
        navigate('/chat')
        localStorage.setItem('token',response.token)
        localStorage.setItem("user", JSON.stringify(response.user));
      }
      showSuccessToast('Logged In')
      dispatch(setUser({user:response.user,token:response.token}))
      
    } catch (error) {
      showErrorToast("Error Logging In")
      
      // Show error to user
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormData({
       email: "",
    password: "",
    confirmpassword: "",
    fullName: "",
    userName: "",
    gender: "",
    })
    handleLogin();
    if (activeTab === "login") {
      console.log("Login attempt:", {
        userName: formData.userName,
        password: formData.password,
      });
    } else {
      console.log("Register attempt:", formData);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">ChatFlow</h1>
          <p className="text-slate-600">Connect with friends instantly</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/20">
          {/* Tab Navigation */}
          <div className="tabs tabs-boxed bg-slate-100/50 p-1 mb-8 rounded-2xl">
            <button
              className={`flex-1 rounded-xl px-4 py-2 text-center font-medium cursor-pointer transition-all duration-300 ${
                activeTab === "login"
                  ? "bg-white text-slate-800 shadow"
                  : "text-slate-500 hover:text-slate-700"
              }`}
              onClick={() => setActiveTab("login")}
            >
              Login
            </button>
            <button
              className={`flex-1 rounded-xl px-4 py-2 text-center font-medium cursor-pointer transition-all duration-300 ${
                activeTab === "register"
                  ? "bg-white text-slate-800 shadow"
                  : "text-slate-500 hover:text-slate-700"
              }`}
              onClick={() => setActiveTab("register")}
            >
              Sign Up
            </button>
          </div>

          {/* Form Content */}
          <div className="space-y-6 ">
            {activeTab === "register" && (
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text text-slate-700 font-medium">
                    Full Name
                  </span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Enter your full name"
                  className="input w-full input-bordered text-gray-700 bg-slate-50/50 border-slate-200 focus:border-blue-400 focus:bg-white rounded-xl h-12 transition-all duration-200"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required={activeTab === "register"}
                />
              </div>
            )}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text text-slate-700 font-medium">
                  User Name
                </span>
              </label>
              <input
                type="text"
                name="userName"
                placeholder="Enter your full name"
                className="input w-full input-bordered text-gray-700 bg-slate-50/50 border-slate-200 focus:border-blue-400 focus:bg-white rounded-xl h-12 transition-all duration-200"
                value={formData.userName}
                onChange={handleInputChange}
                required={activeTab === "register"}
              />
            </div>

            {activeTab === "register" && (
              <div className="form-control">
                <label className="label block">
                  <span className="label-text text-slate-700 font-medium">
                    Email
                  </span>
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  className="input w-full input-bordered text-gray-700 bg-slate-50/50 border-slate-200 focus:border-blue-400 focus:bg-white rounded-xl h-12 transition-all duration-200"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            )}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-slate-700 font-medium">
                  Password
                </span>
              </label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                className="input w-full input-bordered bg-slate-50/50 text-gray-700 border-slate-200 focus:border-blue-400 focus:bg-white rounded-xl h-12 transition-all duration-200"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>

            {activeTab === "register" && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-slate-700 font-medium">
                    Confirm Password
                  </span>
                </label>
                <input
                  type="password"
                  name="confirmpassword"
                  placeholder="Confirm your password"
                  className="input w-full input-bordered bg-slate-50/50 text-gray-700 border-slate-200 focus:border-blue-400 focus:bg-white rounded-xl h-12 transition-all duration-200"
                  value={formData.confirmpassword}
                  onChange={handleInputChange}
                  required={activeTab === "register"}
                />
              </div>
            )}

            {activeTab === "register" && (
              <div className="form-control">
                <label className="label block mb-3">
                  <span className="label-text text-slate-700 font-medium">
                    Gender
                  </span>
                </label>
                <div className="flex gap-5">
                  <div className="flex gap-3">
                    <label className="text-black">Male</label>
                    <input
                      type="radio"
                      name="gender"
                      value="male"
                      checked={formData.gender === "male"}
                      onChange={handleInputChange}
                      className="radio text-black"
                    />
                  </div>
                  <div className="flex gap-3">
                    <label className="text-black">Female</label>
                    <input
                      type="radio"
                      name="gender"
                      value="female"
                      checked={formData.gender === "female"}
                      onChange={handleInputChange}
                      className="radio text-black"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "login" && (
              <div className="text-right">
                <a
                  href="#"
                  className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Forgot password?
                </a>
              </div>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              className="btn w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0 text-white rounded-xl h-12 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
            >
              {activeTab === "login" ? (
                <>
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                  Sign In
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Create Account
                </>
              )}
            </button>
          </div>

          {/* Social Login */}
          <div className="divider text-slate-400 text-sm mt-8">
            or continue with
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6">
            {/* Google Button */}
            <button
              className="flex items-center justify-center gap-2 bg-gradient-to-br from-gray-900 via-gray-800 to-black
               text-white rounded-xl h-12 w-full transition-all duration-300 hover:bg-gray-100 hover:text-black"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span className="text-sm font-medium">Google</span>
            </button>

            {/* GitHub Button */}
            <button
              className="flex items-center justify-center gap-2 bg-gradient-to-br from-gray-900 via-gray-800 to-black
               text-white rounded-xl h-12 w-full transition-all duration-300 hover:bg-gray-100 hover:text-black"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.024-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.097.118.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.001 12.017.001z" />
              </svg>
              <span className="text-sm font-medium">GitHub</span>
            </button>
          </div>

          {/* Footer Text */}
          <p className="text-center text-sm text-slate-500 mt-6">
            {activeTab === "login" ? (
              <>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setActiveTab("register")}
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Sign up here
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setActiveTab("login")}
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Sign in here
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
