import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import AddExpense from '../components/AddExpanse';
import axios from 'axios';
import Navbar from "../components/Navbar.jsx";
import { BASE_URL } from '../Service/helper';
import About from '../components/About.jsx';
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28BD4', '#FF6666', '#FF00A0', '#00B8D9'];

function HomePage() {
  const [expenses, setExpenses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [savingsGoal, setSavingsGoal] = useState(50000); // Example savings goal

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/expenses`);
      setExpenses(res.data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const aggregateByType = () => {
    const totals = {};
    expenses.forEach(exp => {
      const type = exp.type.toLowerCase();
      totals[type] = (totals[type] || 0) + parseFloat(exp.amount);
    });
    return Object.entries(totals).map(([type, amount]) => ({ name: type, value: amount }));
  };

  const totalExpense = expenses.reduce((acc, exp) => acc + parseFloat(exp.amount), 0);
  const expenseData = aggregateByType();

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-blue-100 to-teal-100 p-6 animate-fade-in">
      <Navbar active="home" setActive={() => {}} />
       <div className="mt-[250px] mb-[200px]">
  <About />
</div>
      <div className="flex flex-col md:flex-row gap-12 items-center justify-center my-16">
        <div className="w-full md:w-1/2 h-96 animate-slide-left bg-white rounded-3xl shadow-lg p-6">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={expenseData}
                cx="50%"
                cy="50%"
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                label
              >
                {expenseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl w-full md:w-1/3 animate-slide-right">
          <h2 className="text-3xl font-semibold text-indigo-700 mb-6 text-center">Savings Overview</h2>
          <p className="text-lg text-gray-800 mb-3">Total Expense: <span className="font-bold text-red-500">₹{totalExpense}</span></p>
          <p className="text-lg text-gray-800 mb-3">Savings Goal: <span className="font-bold text-green-600">₹{savingsGoal}</span></p>
          <p className={`text-lg font-semibold ${totalExpense > savingsGoal ? 'text-red-600' : 'text-green-600'}`}>
            Remaining: ₹{Math.max(savingsGoal - totalExpense, 0)}
          </p>
        </div>
      </div>
      


      <div className="text-center mt-20">
      <div className="text-center pt-24">
        <button
          onClick={() => setShowForm(true)}
          className="px-10 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-2xl rounded-full shadow-2xl hover:scale-110 transform transition duration-300 animate-bounce"
        >
          + Add Expense
        </button>
      </div>

      {/* Conditionally Render Expense Form as Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="relative w-full max-w-xl mx-auto">
            <button
              className="absolute -top-4 -right-4 bg-white rounded-full p-1 shadow-lg z-50"
              onClick={() => setShowForm(false)}
            >
              ❌
            </button>
            <AddExpense />
          </div>
        </div>
      )}
    </div>


       


     
    </div>
  );
}

export default HomePage;
