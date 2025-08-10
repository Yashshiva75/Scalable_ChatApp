import React, { useEffect, useState } from "react";
import { authApi } from "../Apis/authApis";
import { useDispatch } from "react-redux";
import { setUser } from "../Store/userSlice";
import { showSuccessToast, showErrorToast } from "../utils/toasts/ReactToast";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";

export default function AuthUI() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const BASE_API = import.meta.env.VITE_REACT_APP_API_URL;

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

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        console.log("Google login success:", tokenResponse);
        
        // Get user info using the access token
        const userInfoResponse = await axios.get(
          `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokenResponse.access_token}`,
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          }
        );
        
        const userInfo = userInfoResponse.data;
        console.log("User info from Google:", userInfo);
        
        // Send to your backend
        const loginWithGoogle = await axios.post(
          `${BASE_API}/api/loginwithgoogle`,
          userInfo,
          {
            headers: {
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );
        
        console.log("Backend response:", loginWithGoogle.data);
        
        const mappedItems = {
          fullName: userInfo.name,
          userName: userInfo.name,
          profilePhoto: userInfo.picture,
          email: userInfo.email,
        };
        
        dispatch(setUser({ user: mappedItems, token: tokenResponse.access_token }));
        sessionStorage.setItem("token", tokenResponse.access_token);
        sessionStorage.setItem("user", JSON.stringify(mappedItems));
        showSuccessToast("Logged in with Google");
        navigate("/chat");
        
      } catch (err) {
        console.error("Google login failed:", err);
        showErrorToast("Google login failed");
      }
    },
    onError: (error) => {
      console.error("Google login error:", error);
      showErrorToast("Google Login Failed");
    },
  });

  const handleLogin = async () => {
    try {
      const apiCall =
        activeTab === "register"
          ? authApi.register(formData)
          : authApi.login(formData);
      const response = await apiCall;

      if (response.token) {
        navigate("/chat");
        sessionStorage.setItem("token", response.token);
        sessionStorage.setItem("user", JSON.stringify(response.user));
      }
      showSuccessToast("Logged In");
      dispatch(setUser({ user: response.user, token: response.token }));
    } catch (error) {
      showErrorToast("Error Logging In");
    }
  };

  const [buttonWidth, setButtonWidth] = useState(370);

  useEffect(() => {
    const updateWidth = () => {
      const screenWidth = window.innerWidth;
      if (screenWidth < 400) {
        // On very small screens, use a minimum width that looks good
        setButtonWidth(Math.max(280, screenWidth - 50));
      } else {
        // On larger screens, use the original width
        setButtonWidth(370);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin();
    setFormData({
      email: "",
      password: "",
      confirmpassword: "",
      fullName: "",
      userName: "",
      gender: "",
    });
    
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
    <div className="min-h-screen bg-gradient-to-br from-cyan-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
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
                placeholder="Enter your user name"
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

          {/* Fancy Google Button with Rapidly Moving Dots */}
          <div className="flex justify-center">
            <style>{`
              @keyframes moveRandom1 {
                0% { transform: translate(0, 0); }
                25% { transform: translate(15px, -10px); }
                50% { transform: translate(-8px, 12px); }
                75% { transform: translate(20px, 5px); }
                100% { transform: translate(0, 0); }
              }
              @keyframes moveRandom2 {
                0% { transform: translate(0, 0); }
                20% { transform: translate(-12px, 8px); }
                40% { transform: translate(18px, -15px); }
                60% { transform: translate(5px, 20px); }
                80% { transform: translate(-20px, -5px); }
                100% { transform: translate(0, 0); }
              }
              @keyframes moveRandom3 {
                0% { transform: translate(0, 0); }
                30% { transform: translate(10px, 15px); }
                60% { transform: translate(-15px, -8px); }
                90% { transform: translate(8px, -12px); }
                100% { transform: translate(0, 0); }
              }
              @keyframes moveRandom4 {
                0% { transform: translate(0, 0); }
                15% { transform: translate(-18px, 12px); }
                35% { transform: translate(10px, -20px); }
                55% { transform: translate(22px, 8px); }
                75% { transform: translate(-5px, 18px); }
                100% { transform: translate(0, 0); }
              }
              @keyframes moveRandom5 {
                0% { transform: translate(0, 0); }
                40% { transform: translate(14px, -18px); }
                70% { transform: translate(-22px, 10px); }
                100% { transform: translate(0, 0); }
              }
              .dot-1 { animation: moveRandom1 1.2s infinite linear; }
              .dot-2 { animation: moveRandom2 0.9s infinite linear; }
              .dot-3 { animation: moveRandom3 1.5s infinite linear; }
              .dot-4 { animation: moveRandom4 0.7s infinite linear; }
              .dot-5 { animation: moveRandom5 1.8s infinite linear; }
              .dot-6 { animation: moveRandom1 1.1s infinite linear reverse; }
              .dot-7 { animation: moveRandom3 0.8s infinite linear reverse; }
              .dot-8 { animation: moveRandom2 1.3s infinite linear reverse; }
            `}</style>
            <button 
              onClick={googleLogin}
              className="relative flex items-center justify-center gap-3 w-full max-w-xs bg-black border border-gray-700 rounded-full px-5 py-3 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 group overflow-hidden"
            >
              {/* Rapidly moving dots in random directions */}
              <div className="absolute w-1 h-1 bg-white rounded-full opacity-60 dot-1 top-3 left-4"></div>
              <div className="absolute w-1.5 h-1.5 bg-white rounded-full opacity-40 dot-2 top-8 left-8"></div>
              <div className="absolute w-1 h-1 bg-white rounded-full opacity-60 dot-3 top-4 right-8"></div>
              <div className="absolute w-2 h-2 bg-white rounded-full opacity-30 dot-4 bottom-3 right-4"></div>
              <div className="absolute w-1 h-1 bg-white rounded-full opacity-60 dot-5 top-5 left-1/2"></div>
              <div className="absolute w-1.5 h-1.5 bg-white rounded-full opacity-40 dot-6 top-2 right-16"></div>
              <div className="absolute w-1 h-1 bg-white rounded-full opacity-60 dot-7 bottom-4 left-12"></div>
              <div className="absolute w-1.5 h-1.5 bg-white rounded-full opacity-40 dot-8 top-3 right-12"></div>
              
              {/* Shimmer effect */}
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-1000"></div>
              
              {/* Google icon with white color */}
              <svg className="w-5 h-5 relative z-10" viewBox="0 0 24 24">
                <path fill="white" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="white" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="white" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="white" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              
              <span className="text-white font-medium text-sm relative z-10 group-hover:text-gray-100 transition-colors">
                Continue with Google
              </span>
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