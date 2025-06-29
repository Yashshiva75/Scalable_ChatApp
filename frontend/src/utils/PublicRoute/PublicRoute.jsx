import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

export const PublicRoute = ({ children }) => {
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);

  if (isAuthenticated) {
    // Already logged in → chat pe bhej do
    return <Navigate to="/chat" replace />;
  }

  return children;
};
