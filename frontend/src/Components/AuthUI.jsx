import React, { useEffect, useState } from "react";
import { authApi } from "../Apis/authApis";
import { useDispatch } from "react-redux";
import { setUser } from "../Store/userSlice";
import { showSuccessToast, showErrorToast } from "../utils/toasts/ReactToast";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
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

  //Session storage items mapper

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
      const { credential } = credentialResponse;

      if (!credential) {
        showErrorToast("Google credential not found");
        return;
      }

      // Decode the JWT token from Google
      const decoded = jwtDecode(credential);

      const mappedItems = {
        fullName: decoded.name,
        userName: decoded.name,
        profilePhoto: decoded.picture,
      };
      // You can now use `decoded` to get user's email, name, etc.
      const loginWithGoogle = await axios.post(
        `${BASE_API}/api/loginwithgoogle`,
        decoded,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      dispatch(setUser({ user: mappedItems, token: credential }));
      sessionStorage.setItem("token", credential);
      sessionStorage.setItem("user", JSON.stringify(mappedItems));
      showSuccessToast("Logged in with Google");
      navigate("/chat");
    } catch (err) {
      console.error("Google login decode failed:", err);
      showErrorToast("Google login failed");
    }
  };
  const [buttonWidth, setButtonWidth] = useState(370);

  useEffect(() => {
    const updateWidth = () => {
      const screenWidth = window.innerWidth;
      const maxWidth = screenWidth - 100; // Account for px-4 (16px each side)
      setButtonWidth(Math.min(370, maxWidth));
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormData({
      email: "",
      password: "",
      confirmpassword: "",
      fullName: "",
      userName: "",
      gender: "",
    });
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

            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={() => showErrorToast("Google Login Failed")}
              theme="outline"
              size="large"
              shape="pill"
              text="continue_with"
              width={buttonWidth}
            />
          

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
