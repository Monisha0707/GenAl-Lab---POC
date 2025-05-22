import { useState } from "react";
import { close, menu } from "../assets/Home";
import { navLinks } from "../constants/Home";
import { Link } from "react-router-dom";

const Navbar = ({ active, setActive }) => {
  const [toggle, setToggle] = useState(false);

  return (
    <nav className="w-full flex py-4 -mb-2 -mt-2 justify-between items-center navbar px-6 bg-white shadow-md">
      <span className="ml-3 mt-2 text-xl text-black font-extrabold tracking-tight text-slate-900">
        OraChat
      </span>

      <ul className="list-none sm:flex hidden justify-end items-center flex-1">
        {navLinks.map((nav, index) => (
          <li
            key={nav.id}
            className={`cursor-pointer text-[16px] font-bold ${
              active === nav.id ? "text-green-600 font-extrabold" : "text-black"
            } ${index === navLinks.length - 1 ? "mr-0" : "mr-10"}`}
            onClick={() => setActive(nav.id)}
          >
            {nav.title}
          </li>
        ))}
      </ul>

      <div className="sm:hidden flex flex-1 justify-end items-center">
        <img
          src={toggle ? close : menu}
          alt="menu"
          className="w-[28px] h-[28px] object-contain"
          onClick={() => setToggle(!toggle)}
        />

        <div
          className={`${
            !toggle ? "hidden" : "flex"
          } p-6 bg-gray-100 absolute top-20 right-0 mx-4 my-2 min-w-[140px] rounded-xl sidebar`}
        >
          <ul className="list-none flex justify-end items-start flex-1 flex-col">
            {navLinks.map((nav, index) => (
              <li
                key={nav.id}
                className={`cursor-pointer text-[16px] font-bold ${
                  active === nav.id ? "text-green-600 font-extrabold" : "text-black"
                } ${index === navLinks.length - 1 ? "mb-0" : "mb-4"}`}
                onClick={() => {
                  setActive(nav.id);
                  setToggle(false);
                }}
              >
                {nav.title}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
