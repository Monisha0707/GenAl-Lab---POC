import React from "react";

const About = () => {
  return (
    <div className="mt-200px">
      <header className="text-center my-12">
        <h1 className="text-6xl font-extrabold text-indigo-700 tracking-tight mb-4 animate-slide-down drop-shadow-md">
          Expense Tracker & AI Savings Manager
        </h1>
        <p className="text-4xl leading-relaxed text-gray-700 max-w-4xl mx-auto animate-fade-in-delay font-bold text-center">
  A smart solution to help you manage your daily spending and achieve your savings goals using AI-powered insights.
</p>

      </header>

      {/* <section className="max-w-4xl mx-auto text-lg text-gray-700 leading-relaxed font-medium p-6 ">
        <p className="mb-6">
          Our platform is designed to empower users with better financial control through intuitive dashboards, detailed expense tracking, and personalized AI suggestions. Whether you're budgeting for the month or planning for long-term goals, our tool has your back.
        </p>
        <p className="mb-6">
          Built with modern technologies and a focus on user experience, this solution adapts to your lifestyle and spending habits. Let data work for you and unlock the potential of AI to achieve your savings targets.
        </p>
      </section> */}
    </div>
  );
};

export default About;
