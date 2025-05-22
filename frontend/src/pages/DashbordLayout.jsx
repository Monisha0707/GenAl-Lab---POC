import React from 'react';

const DashboardLayout = ({ children }) => {
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br "
    >
      <div className="w-full max-w-6xl bg-white bg-opacity-80 rounded-lg shadow-xl p-8">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
