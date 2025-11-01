import React, { useState } from 'react';
import axios from 'axios';
import { useSelector } from "react-redux";

import { BASE_URL } from "../Service/helper.js";

function AddExpense() {
  const userID = useSelector((state) => state.user.userID);
  console.log("User ID:", userID);
  const [formData, setFormData] = useState({
    amount: '',
    type: '',
    customType: '',
    specification: '',
    place: '',
    userID: userID || '', // Ensure userID is include
    date: new Date().toISOString().split('T')[0],
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const expenseTypes = [
    'food', 'sport', 'education', 'grocery', 'entertainment', 'travel', 'trip', 'others'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const finalType = formData.type === 'others' ? formData.customType : formData.type;

    try {
      const res = await axios.post(`${BASE_URL}/add-expense`, {
        ...formData,
        type: finalType
      });

      setMessage("✅ Expense added successfully!");
      setFormData({
        amount: '',
        type: '',
        customType: '',
        specification: '',
        place: '',
        date: new Date().toISOString().split('T')[0],
      });
    } catch (err) {
      setError("❌ Error adding expense. Please try again.");
    }
  };

  return (
   
      <div className="p-6 w-full max-w-xl bg-white shadow-2xl rounded-3xl border border-gray-200 animate-fade-in">
      <div className="p-6 w-full max-w-xl animate-fade-in bg-white shadow-2xl rounded-3xl border border-gray-200">
        <h1 className="text-4xl font-bold text-center mb-6 text-blue-700 tracking-wide italic">
          Add Expense
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
  {/* Amount */}
  <div className="flex items-center space-x-4">
    <label className="w-24 text-sm font-medium text-gray-700">Amount</label>
    <input
      type="number"
      name="amount"
      value={formData.amount}
      onChange={handleChange}
      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none transition duration-200"
      required
    />
  </div>

  {/* Type */}
  <div className="flex items-center space-x-4">
    <label className="w-24 text-sm font-medium text-gray-700">Type</label>
    <select
      name="type"
      value={formData.type}
      onChange={handleChange}
      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none transition duration-200"
      required
    >
      <option value="">Select a type</option>
      {expenseTypes.map((type) => (
        <option key={type} value={type}>
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </option>
      ))}
    </select>
  </div>

  {/* Custom Type (only if 'others') */}
  {formData.type === 'others' && (
    <div className="flex items-center space-x-4">
      <label className="w-24 text-sm font-medium text-gray-700">Custom</label>
      <input
        type="text"
        name="customType"
        value={formData.customType}
        onChange={handleChange}
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none transition duration-200"
        placeholder="Enter custom category"
        required
      />
    </div>
  )}

  {/* Specification */}
  <div className="flex items-center space-x-4">
    <label className="w-24 text-sm font-medium text-gray-700">Details</label>
    <input
      type="text"
      name="specification"
      value={formData.specification}
      onChange={handleChange}
      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none transition duration-200"
      placeholder="e.g., Dinner at XYZ"
    />
  </div>

  {/* Place */}
  <div className="flex items-center space-x-4">
    <label className="w-24 text-sm font-medium text-gray-700">Place</label>
    <input
      type="text"
      name="place"
      value={formData.place}
      onChange={handleChange}
      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none transition duration-200"
      required
    />
  </div>

  {/* Date (read-only) */}
  <div className="flex items-center space-x-4">
    <label className="w-24 text-sm font-medium text-gray-700">Date</label>
    <input
      type="date"
      name="date"
      value={formData.date}
      onChange={handleChange}
      readOnly
      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
    />
  </div>

  {/* Submit Button */}
  <button
    type="submit"
    className="w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg shadow-md hover:scale-105 transition-transform duration-300"
  >
    Submit Expense
  </button>
</form>

        {message && (
          <p className="text-center text-green-600 mt-4 animate-fade-in-fast">{message}</p>
        )}
        {error && (
          <p className="text-center text-red-500 mt-4 animate-fade-in-fast">{error}</p>
        )}
      </div>
    </div>
  );
}

export default AddExpense;
