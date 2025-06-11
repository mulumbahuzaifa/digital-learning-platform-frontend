import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from "../../../context/AuthProvider";
import {
  AcademicCapIcon,
  BookOpenIcon,
  ChartBarIcon,
  UsersIcon,
  BoltIcon,
  UserCircleIcon,
  ArrowRightStartOnRectangleIcon
} from "@heroicons/react/24/outline";

const Logo = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="36" height="36" rx="10" fill="#4F46E5"/>
    <path d="M9 11L18 7L27 11L18 15L9 11Z" fill="white"/>
    <path d="M9 11V19L18 23L27 19V11" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <path d="M18 15V23" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <path d="M13 13L23 9" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);


export default function AuthNavbar() {
  const [navbarOpen, setNavbarOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const navigation = [
    { name: "Courses", href: "/courses", icon: BookOpenIcon },
    { name: "Features", href: "/features", icon: BoltIcon },
    { name: "About", href: "/about", icon: UsersIcon },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
    setNavbarOpen(false);
  };

  return (
    <nav
      className="fixed w-full z-50 bg-white/95 backdrop-blur-sm shadow-sm transition-all duration-300 ease-in-out"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo and main nav */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center group">
              <Logo />
              <span className="ml-3 text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent group-hover:from-indigo-500 group-hover:to-purple-500 transition-all duration-300 hidden md:block">
                NEWSOMA
              </span>
            </Link>
            
            <div className="hidden md:block ml-10">
              <div className="flex space-x-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-md text-sm font-medium flex items-center transition duration-150"
                  >
                    <item.icon className="h-5 w-5 mr-1" />
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right side - Auth buttons */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {isAuthenticated ? (
                <>
                  <Link
                    to={user ? `/${user.role}` : "/login"}
                    className="text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-md text-sm font-medium flex items-center transition duration-150"
                  >
                    <UserCircleIcon className="h-5 w-5 mr-1" />
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-md text-sm font-medium flex items-center transition duration-150"
                  >
                    <ArrowRightStartOnRectangleIcon className="h-5 w-5 mr-1" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition duration-150"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="ml-3 bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition duration-150 shadow-sm"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setNavbarOpen(!navbarOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 focus:outline-none transition duration-150"
            >
              <span className="sr-only">Open main menu</span>
              {navbarOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {navbarOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 block px-3 py-2 rounded-md text-base font-medium flex items-center transition duration-150"
                onClick={() => setNavbarOpen(false)}
              >
                <item.icon className="h-5 w-5 mr-2" />
                {item.name}
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            {isAuthenticated ? (
              <div className="px-5 space-y-1">
                <Link
                  to={`/${user?.role}`}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 flex items-center transition duration-150"
                  onClick={() => setNavbarOpen(false)}
                >
                  <UserCircleIcon className="h-5 w-5 mr-2" />
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 flex items-center transition duration-150"
                >
                  <ArrowRightStartOnRectangleIcon className="h-5 w-5 mr-2" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="px-5 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <Link
                  to="/login"
                  className="block w-full sm:w-auto px-4 py-2 rounded-md text-base font-medium text-center text-gray-600 hover:text-indigo-600 border border-gray-200 hover:border-indigo-500 transition duration-150"
                  onClick={() => setNavbarOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="block w-full sm:w-auto px-4 py-2 rounded-md text-base font-medium text-center text-white bg-indigo-600 hover:bg-indigo-700 transition duration-150 shadow-sm"
                  onClick={() => setNavbarOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}