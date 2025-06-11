import React, { useRef, useState } from "react";
import { createPopper } from "@popperjs/core";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import { 
  UserCircleIcon, 
  CogIcon, 
  QuestionMarkCircleIcon, 
  ArrowRightEndOnRectangleIcon
  
} from "@heroicons/react/24/outline";

interface DropdownItem {
  label: string;
  icon: React.ReactNode;
  path?: string;
  action?: () => void;
  separator?:boolean;
}

const UserDropdown: React.FC = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleDropdown = () => {
    if (dropdownOpen) {
      setDropdownOpen(false);
    } else {
      setDropdownOpen(true);
      if (btnRef.current && popoverRef.current) {
        createPopper(btnRef.current, popoverRef.current, {
          placement: "bottom-end",
        });
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
    setDropdownOpen(false);
  };

  const dropdownItems: DropdownItem[] = [
    { 
      label: "Profile", 
      icon: <UserCircleIcon className="h-5 w-5 mr-2" />,
      path: user ? `/${user.role}/profile` : "/profile"
    },
    { 
      label: "Settings", 
      icon: <CogIcon className="h-5 w-5 mr-2" />,
      path: user ? `/${user.role}/settings` : "/settings"
    },
    {
      separator: true,
      label: "",
      icon: undefined
    },
    { 
      label: "Help Center", 
      icon: <QuestionMarkCircleIcon className="h-5 w-5 mr-2" />,
      path: "/help"
    },
    { 
      label: "Logout", 
      icon: <ArrowRightEndOnRectangleIcon className="h-5 w-5 mr-2" />,
      action: handleLogout
    }
  ];

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={toggleDropdown}
        className="flex items-center focus:outline-none"
        aria-label="User menu"
      >
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-indigo-100">
          <img
            className="w-full h-full object-cover"
            src={user?.profile?.avatar || "/img/default.png"}
            alt={user ? `${user.firstName} ${user.lastName}` : "User"}
          />
        </div>
        <span className="hidden md:inline-block ml-2 text-sm font-medium text-blueGray-700">
          {user ? `${user.firstName} ${user.lastName}` : "Account"}
        </span>
      </button>

      <div
        ref={popoverRef}
        className={`${dropdownOpen ? "block" : "hidden"} bg-white text-base z-50 float-left py-2 list-none text-left rounded-lg shadow-xl min-w-48`}
      >
        <div className="px-4 py-3 border-b border-blueGray-200">
          <p className="text-sm font-medium text-blueGray-800">
            {user ? `${user.firstName} ${user.lastName}` : "Welcome"}
          </p>
          <p className="text-xs text-blueGray-500 truncate">
            {user?.email || "Guest"}
          </p>
        </div>
        
        <ul className="py-1">
          {dropdownItems.map((item, index) => (
            <React.Fragment key={index}>
              {item.separator ? (
                <li className="h-0 my-1 border border-solid border-blueGray-100" />
              ) : item.path ? (
                <li>
                  <Link
                    to={item.path}
                    className="flex items-center px-4 py-2 text-sm text-blueGray-700 hover:bg-blueGray-100 w-full text-left"
                    onClick={() => setDropdownOpen(false)}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                </li>
              ) : (
                <li>
                  <button
                    onClick={item.action}
                    className="flex items-center px-4 py-2 text-sm text-blueGray-700 hover:bg-blueGray-100 w-full text-left"
                  >
                    {item.icon}
                    {item.label}
                  </button>
                </li>
              )}
            </React.Fragment>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default UserDropdown;