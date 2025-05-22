import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../redux/features/authSlice";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch(); // ✅ moved inside the component

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
  const response = await fetch("http://localhost:5000/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });

  const data = await response.json(); // parse response body ONCE
  console.log(data); // log the response for debugging
  if (response.ok) {
    // Save to localStorage
    localStorage.setItem("token", data.token);
    localStorage.setItem("email", data.email);
    dispatch(loginSuccess({ email: data.email, token: data.token }));
    navigate("/home");
  } else {
    setError(data.error || "Login failed");
  }
} catch (err) {
  setError("Server error, please try again later.");
}

  };
  return (
    <div className="max-w-md mx-auto mt-12 p-8 bg-white rounded-xl shadow-lg font-sans">
  <h2 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">Login</h2>
  {error && <p className="text-red-600 mb-4">{error}</p>}
  <form onSubmit={handleSubmit} className="space-y-6">
    <input
      type="email"
      placeholder="Email"
      name="email"
      value={formData.email}
      onChange={handleChange}
      required
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
    />
    <input
      type="password"
      placeholder="Password"
      name="password"
      value={formData.password}
      onChange={handleChange}
      required
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
    />
    <button
      type="submit"
      className="w-full bg-teal-500 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors duration-300"
    >
      Login
    </button>
  </form>
</div>

  );
};

export default Login;
