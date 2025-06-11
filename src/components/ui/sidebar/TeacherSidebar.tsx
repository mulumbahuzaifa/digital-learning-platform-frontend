import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import UserDropdown from "../UserDropdown";
import NotificationDropdown from "../NotificationDropdown";

interface SidebarLinkProps {
  to: string;
  icon: string;
  text: string;
}

interface SidebarDropdownItem extends SidebarLinkProps {}

interface SidebarDropdownProps {
  title: string;
  icon: string;
  items: SidebarDropdownItem[];
}

const SidebarDropdown: React.FC<SidebarDropdownProps> = ({ 
  title, 
  icon, 
  items 
}) => {
  const location = useLocation();
  const isAnyActive = items.some(item => location.pathname.includes(item.to));
  const [isOpen, setIsOpen] = useState(isAnyActive);

  return (
    <li className="items-center mb-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`text-xs uppercase py-3 font-bold flex items-center w-full ${
          isAnyActive
            ? "text-lightBlue-500 hover:text-lightBlue-600"
            : "text-blueGray-700 hover:text-blueGray-500"
        }`}
      >
        <i className={`${icon} mr-2 text-sm ${isAnyActive ? "opacity-75" : "text-blueGray-300"}`}></i>
        {title}
        <i className={`fas fa-chevron-${isOpen ? 'down' : 'right'} ml-auto text-xs`}></i>
      </button>
      {isOpen && (
        <ul className="pl-6 mt-1 mb-2 space-y-1">
          {items.map((item) => (
            <SidebarLink key={item.to} {...item} nested={true} />
          ))}
        </ul>
      )}
    </li>
  );
};

const SidebarLink: React.FC<SidebarLinkProps & { nested?: boolean }> = ({ to, icon, text, nested = false }) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/teacher' && location.pathname.startsWith(to));
  
  return (
    <li className={`items-center ${nested ? '' : 'mb-2'}`}>
      <Link
        to={to}
        className={`text-xs uppercase py-2 font-bold block ${
          isActive
            ? "text-lightBlue-500 hover:text-lightBlue-600"
            : "text-blueGray-700 hover:text-blueGray-500"
        }`}
      >
        <i
          className={`${icon} mr-2 text-sm ${
            isActive ? "opacity-75" : "text-blueGray-300"
          }`}
        ></i>
        {text}
      </Link>
    </li>
  );
};

const TeacherSidebar: React.FC = () => {
  const [collapseShow, setCollapseShow] = useState<string>("hidden");

  return (
    <nav className="md:left-0 md:block md:fixed md:top-0 md:bottom-0 md:overflow-y-auto md:flex-row md:flex-nowrap md:overflow-hidden shadow-xl bg-white flex flex-wrap items-center justify-between relative md:w-64 z-10 py-4 px-6">
      <div className="md:flex-col md:items-stretch md:min-h-full md:flex-nowrap px-0 flex flex-wrap items-center justify-between w-full mx-auto">
        {/* Toggler */}
        <button
          className="cursor-pointer text-black opacity-50 md:hidden px-3 py-1 text-xl leading-none bg-transparent rounded border border-solid border-transparent"
          type="button"
          onClick={() => setCollapseShow("bg-white m-2 py-3 px-6")}
        >
          <i className="fas fa-bars"></i>
        </button>

        {/* Brand */}
        <Link
          to="/teacher"
          className="md:block text-left md:pb-2 text-blueGray-600 mr-0 inline-block whitespace-nowrap text-sm uppercase font-bold p-4 px-0"
        >
          NEWSOMA
        </Link>
        
        {/* User */}
        <ul className="md:hidden items-center flex flex-wrap list-none">
          <li className="inline-block relative">
            <NotificationDropdown />
          </li>
          <li className="inline-block relative">
            <UserDropdown />
          </li>
        </ul>
        
        {/* Collapse */}
        <div
          className={`md:flex md:flex-col md:items-stretch md:opacity-100 md:relative md:mt-4 md:shadow-none shadow absolute top-0 left-0 right-0 z-40 overflow-y-auto overflow-x-hidden h-auto items-center flex-1 rounded ${collapseShow}`}
        >
          {/* Collapse header */}
          <div className="md:min-w-full md:hidden block pb-4 mb-4 border-b border-solid border-blueGray-200">
            <div className="flex flex-wrap">
              <div className="w-6/12">
                <Link
                  to="/teacher"
                  className="md:block text-left md:pb-2 text-blueGray-600 mr-0 inline-block whitespace-nowrap text-sm uppercase font-bold p-4 px-0"
                >
                  NEWSOMA
                </Link>
              </div>
              <div className="w-6/12 flex justify-end">
                <button
                  type="button"
                  className="cursor-pointer text-black opacity-50 md:hidden px-3 py-1 text-xl leading-none bg-transparent rounded border border-solid border-transparent"
                  onClick={() => setCollapseShow("hidden")}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
          </div>
          
          {/* Form */}
          <form className="mt-6 mb-4 md:hidden">
            <div className="mb-3 pt-0">
              <input
                type="text"
                placeholder="Search"
                className="border-0 px-3 py-2 h-12 border border-solid border-blueGray-500 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-base leading-snug shadow-none outline-none focus:outline-none w-full font-normal"
              />
            </div>
          </form>

          {/* Divider */}
          <hr className="my-4 md:min-w-full" />

          {/* Navigation */}
          <ul className="md:flex-col md:min-w-full flex flex-col list-none">
            {/* Dashboard */}
            <SidebarLink
              to="/teacher"
              icon="fas fa-tachometer-alt"
              text="Dashboard"
            />

            {/* Class Management */}
            <div className="mt-4 mb-2">
              <h6 className="md:min-w-full text-xs uppercase font-bold block pt-1 pb-2 no-underline text-blueGray-500">
                Class Management
              </h6>
            </div>
            
            <SidebarDropdown
              title="Classes"
              icon="fas fa-chalkboard"
              items={[
                {
                  to: "/teacher/classes",
                  text: "All Classes",
                  icon: "fas fa-list",
                },
                {
                  to: "/teacher/classes/create",
                  text: "Create Class",
                  icon: "fas fa-plus",
                }
              ]}
            />

            <SidebarDropdown
              title="Students"
              icon="fas fa-user-graduate"
              items={[
                {
                  to: "/teacher/students",
                  text: "All Students",
                  icon: "fas fa-users",
                },
                {
                  to: "/teacher/students/enroll",
                  text: "Enroll Students",
                  icon: "fas fa-user-plus",
                }
              ]}
            />

            {/* Teaching Management */}
            <div className="mt-4 mb-2">
              <h6 className="md:min-w-full text-xs uppercase font-bold block pt-1 pb-2 no-underline text-blueGray-500">
                Teaching Management
              </h6>
            </div>

            <SidebarDropdown
              title="Assignments"
              icon="fas fa-tasks"
              items={[
                {
                  to: "/teacher/assignments",
                  text: "All Assignments",
                  icon: "fas fa-clipboard-list",
                },
                {
                  to: "/teacher/assignments/create",
                  text: "Create Assignment",
                  icon: "fas fa-plus",
                },
                {
                  to: "/teacher/submissions",
                  text: "Submissions",
                  icon: "fas fa-file-upload",
                }
              ]}
            />

            <SidebarLink
              to="/teacher/gradebook"
              icon="fas fa-graduation-cap"
              text="Gradebook"
            />

            <SidebarLink
              to="/teacher/attendance"
              icon="fas fa-clipboard-check"
              text="Attendance"
            />

            <SidebarDropdown
              title="Learning Content"
              icon="fas fa-file-alt"
              items={[
                {
                  to: "/teacher/content",
                  text: "My Content",
                  icon: "fas fa-folder",
                },
                {
                  to: "/teacher/content/create",
                  text: "Create Content",
                  icon: "fas fa-plus",
                }
              ]}
            />

            {/* Communication */}
            <div className="mt-4 mb-2">
              <h6 className="md:min-w-full text-xs uppercase font-bold block pt-1 pb-2 no-underline text-blueGray-500">
                Communication
              </h6>
            </div>

            <SidebarLink
              to="/teacher/calendar"
              icon="fas fa-calendar-alt"
              text="Calendar"
            />

            <SidebarLink
              to="/teacher/messages"
              icon="fas fa-envelope"
              text="Messages"
            />

            <SidebarLink
              to="/teacher/announcements"
              icon="fas fa-bullhorn"
              text="Announcements"
            />
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default TeacherSidebar; 