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
import Home from "./pages/Home.jsx"; // Assuming you have a Home component
import KBManager from "./components/KBManager.jsx";
import AskKB from "./components/AskKB.jsx";
// import { loginSuccess } from "./redux/features/userSlice";
import EmbeddingManager from "./components/EmbeddingManager.jsx";
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
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/local" element={
          
            <HomePage />
    
        } />
        <Route path="/home" element={
          
            <Home />
         
        } />
        <Route path="/embedding" element={
          
            <EmbeddingManager />
         
        } />
        <Route path="/kb" element={
          <KBManager />
        } />
        <Route path="/askkb" element={
          <AskKB />
        } />

      </Routes>
    </BrowserRouter>
  );
}
