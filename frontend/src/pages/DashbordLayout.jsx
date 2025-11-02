import React from 'react';

const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen w-full flex justify-center bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
      <div className="w-full max-w-6xl bg-white bg-opacity-80 rounded-lg shadow-xl p-0 my-4">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;


