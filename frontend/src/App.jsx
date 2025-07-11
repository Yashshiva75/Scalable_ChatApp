import React, { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./utils/ProtectedRoute/Protected";
import ChatApp from "./Components/ChatUi";
import AuthUI from "./Components/AuthUI";
import { setUser } from "./Store/userSlice";
import { useDispatch } from "react-redux";
import { PublicRoute } from "./utils/PublicRoute/PublicRoute";
import Profile from "./Components/Profile";

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const userData = sessionStorage.getItem("user");

    if (token && userData) {
      dispatch(setUser({ token, user: JSON.parse(userData) }));
    }
  }, []);

  return (
    <>
      <BrowserRouter>
        <ToastContainer />
        <Routes>
          {/* Public route */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <AuthUI />
              </PublicRoute>
            }
          />

          {/* Protected Route */}
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatApp/>
              </ProtectedRoute>
            }
          />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile/>
            </ProtectedRoute>
          }/>
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
