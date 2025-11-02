import { useEffect, useState } from "react";
import { close, menu } from "../assets/Home";
import { navLinks } from "../constants/Home";
import { Link } from "react-router-dom";
import profilePic from "../assets/Home/profile.png";

const Navbar = ({ active, setActive }) => {
  const [toggle, setToggle] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isLoggedIn = true; // Replace with actual auth logic

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`w-full flex items-center justify-between px-8 mt-0 py-2 fixed top-0 left-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white bg-opacity-70 backdrop-blur-md shadow-md"
          : "bg-transparent shadow-none"
      }`}
    >
      {/* Brand */}
      <span className="text-xl font-extrabold text-black tracking-tight">
        OraChat
      </span>

      {/* Center Nav Links */}
      <div className="hidden sm:flex flex-1 justify-center items-center">
        <ul className="flex space-x-10">
          {navLinks.map((nav) => (
            <li
              key={nav.id}
              className={`cursor-pointer text-[20px] font-bold ${
                active === nav.id ? "text-white font-extrabold" : "text-black"
              }`}
              onClick={() => setActive(nav.id)}
            >
              <Link to={`/${nav.id}`}>{nav.title}</Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Right Section */}
      <div className="hidden sm:flex items-center space-x-4">
        {isLoggedIn ? (
          <img
            src={profilePic}
            alt="Profile"
            className="w-12 h-12 rounded-full cursor-pointer object-cover"
          />
        ) : (
          <>
            <Link to="/signin" className="text-blue-600 text-sm font-medium hover:underline">
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-sm bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
            >
              Register
            </Link>
          </>
        )}
      </div>

      {/* Mobile Menu */}
      <div className="sm:hidden flex items-center">
        <img
          src={toggle ? close : menu}
          alt="menu"
          className="w-[28px] h-[28px] object-contain cursor-pointer"
          onClick={() => setToggle(!toggle)}
        />

        <div
          className={`${
            !toggle ? "hidden" : "flex"
          } absolute top-16 right-4 min-w-[180px] bg-white p-6 rounded-xl shadow-lg flex-col z-50`}
        >
          <ul className="flex flex-col space-y-4">
            {navLinks.map((nav) => (
              <li
                key={nav.id}
                className={`cursor-pointer text-[16px] font-bold ${
                  active === nav.id ? "text-green-600 font-extrabold" : "text-black"
                }`}
                onClick={() => {
                  setActive(nav.id);
                  setToggle(false);
                }}
              >
                <Link to={`/${nav.id}`}>{nav.title}</Link>
              </li>
            ))}
            <hr className="border-t mt-2" />
            {isLoggedIn ? (
              <li className="text-blue-600 font-semibold cursor-pointer">Profile</li>
            ) : (
              <>
                <li>
                  <Link to="/signin" className="text-blue-600 font-medium">Sign In</Link>
                </li>
                <li>
                  <Link
                    to="/register"
                    className="bg-blue-600 text-white px-3 py-1 rounded-md"
                  >
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
