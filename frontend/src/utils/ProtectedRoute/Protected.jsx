import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
 
  if (!isAuthenticated) {
    return <Navigate to="/" replace />; 
  }

  return children;
};
