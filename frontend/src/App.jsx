import React, { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./utils/ProtectedRoute/Protected";
import ChatApp from './Components/ChatUi'
import AuthUI from "./Components/AuthUI";
import { setUser } from "./Store/userSlice";
import { useDispatch } from "react-redux";

const App = () => {

  const dispatch = useDispatch();

  useEffect(() => {
  const token = localStorage.getItem("token");
  const userData = localStorage.getItem("user");

  if (token && userData) {
    dispatch(setUser({ token, user: JSON.parse(userData) }));
  }
}, []);

  return (
    <>
      <BrowserRouter>
          <ToastContainer/>
        <Routes>
          <Route path="/" element={<AuthUI />} />

          {/* Protected Route */}
          <Route path="/chat" element={
            <ProtectedRoute>
              <ChatApp/>
            </ProtectedRoute>

          } />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
