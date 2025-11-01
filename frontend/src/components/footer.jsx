import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-200 text-black py-6 mt-2px  rounded-2xl">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        {/* Left Section: Logo / Name */}
        <div className="mb-4 md:mb-0">
          <h2 className="text-xl font-bold">OraChat</h2>
          <p className="text-sm">Empowering your AI journey &copy; {new Date().getFullYear()}</p>
        </div>

        {/* Center Section: Quick Links */}
        <div className="mb-4 md:mb-0">
          <ul className="flex space-x-6">
            <li>
              <Link to="/" className="hover:text-gray-700">Home</Link>
            </li>
            <li>
              <Link to="/chat" className="hover:text-gray-700">Chat</Link>
            </li>
            <li>
              <Link to="/docs" className="hover:text-gray-700">Docs</Link>
            </li>
            <li>
              <Link to="/email-summary" className="hover:text-gray-700">Email Summary</Link>
            </li>
          </ul>
        </div>

        {/* Right Section: Social Icons */}
        <div className="flex space-x-4">
          <a href="https://www.linkedin.com/in/vivek-kumar-b078911b9/" target="_blank" rel="noopener noreferrer" className="hover:text-gray-700">
            LinkedIn
          </a>
          <a href="https://github.com/Vivek7282" target="_blank" rel="noopener noreferrer" className="hover:text-gray-700">
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
