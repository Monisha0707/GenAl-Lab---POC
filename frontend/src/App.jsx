import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/Homepage";
import Register from "./components/register";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import Login from "./components/login";
import PrivateRoute from "./components/PrivateRoute"; // your new file
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { loginSuccess } from "./redux/features/authSlice"; // your Redux slice
// import { loginSuccess } from "./redux/features/userSlice";

const ProtectedRoute = ({ children }) => {
  const email = useSelector((state) => state.user.email);
  if (!email) {
    return <Navigate to="/" replace />;
  }

  return children;
};
export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");

    if (token && email) {
      dispatch(loginSuccess({ email })); // set user as logged in
    }
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}
