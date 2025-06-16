import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import UserDropdown from "../UserDropdown";
import NotificationDropdown from "../NotificationDropdown";

interface SidebarLinkProps {
  to: string;
  icon: string;
  text: string;
}

interface SidebarDropdownProps {
  title: string;
  icon: string;
  items: SidebarLinkProps[];
}

const SidebarDropdown: React.FC<SidebarDropdownProps> = ({
  title,
  icon,
  items,
}) => {
  const location = useLocation();
  const isAnyActive = items.some((item) => location.pathname.includes(item.to));
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
        <i
          className={`${icon} mr-2 text-sm ${
            isAnyActive ? "opacity-75" : "text-blueGray-300"
          }`}
        ></i>
        {title}
        <i
          className={`fas fa-chevron-${
            isOpen ? "down" : "right"
          } ml-auto text-xs`}
        ></i>
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

const SidebarLink: React.FC<SidebarLinkProps & { nested?: boolean }> = ({
  to,
  icon,
  text,
  nested = false,
}) => {
  const location = useLocation();
  const isActive =
    location.pathname === to ||
    (to !== "/admin" && location.pathname.startsWith(to));

  return (
    <li className={`items-center ${nested ? "" : "mb-2"}`}>
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

const Sidebar: React.FC = () => {
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
          to="/"
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
                  to="/"
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
              to="/admin"
              icon="fas fa-tachometer-alt"
              text="Dashboard"
            />

            {/* Academic Management */}
            <div className="mt-4 mb-2">
              <h6 className="md:min-w-full text-xs uppercase font-bold block pt-1 pb-2 no-underline text-blueGray-500">
                Academic Management
              </h6>
            </div>

            <SidebarDropdown
              title="Class Management"
              icon="fas fa-chalkboard"
              items={[
                {
                  to: "/admin/classes",
                  text: "All Classes",
                  icon: "fas fa-list",
                },
                {
                  to: "/admin/classes/create",
                  text: "Create Class",
                  icon: "fas fa-plus",
                },
              ]}
            />

            <SidebarDropdown
              title="Subject Management"
              icon="fas fa-book"
              items={[
                {
                  to: "/admin/subjects",
                  text: "All Subjects",
                  icon: "fas fa-list",
                },
                {
                  to: "/admin/subjects/create",
                  text: "Create Subject",
                  icon: "fas fa-plus",
                },
              ]}
            />

            <SidebarDropdown
              title="Assignments"
              icon="fas fa-tasks"
              items={[
                {
                  to: "/admin/assignments",
                  text: "All Assignments",
                  icon: "fas fa-clipboard-list",
                },
              ]}
            />

            <SidebarLink
              to="/admin/gradebook"
              icon="fas fa-graduation-cap"
              text="Gradebook"
            />

            <SidebarLink
              to="/admin/attendance"
              icon="fas fa-clipboard-check"
              text="Attendance"
            />

            <SidebarDropdown
              title="Learning Content"
              icon="fas fa-file-alt"
              items={[
                {
                  to: "/admin/content",
                  text: "All Content",
                  icon: "fas fa-folder",
                },
                {
                  to: "/admin/content/create",
                  text: "Create Content",
                  icon: "fas fa-plus",
                },
                {
                  to: "/admin/content/categories",
                  text: "Categories",
                  icon: "fas fa-tag",
                },
              ]}
            />

            {/* User Management */}
            <div className="mt-4 mb-2">
              <h6 className="md:min-w-full text-xs uppercase font-bold block pt-1 pb-2 no-underline text-blueGray-500">
                User Management
              </h6>
            </div>

            <SidebarDropdown
              title="Users"
              icon="fas fa-users"
              items={[
                {
                  to: "/admin/users",
                  text: "All Users",
                  icon: "fas fa-list",
                },
                {
                  to: "/admin/users/create",
                  text: "Create User",
                  icon: "fas fa-user-plus",
                },
                {
                  to: "/admin/users/roles",
                  text: "Manage Roles",
                  icon: "fas fa-user-tag",
                },
              ]}
            />

            <SidebarDropdown
              title="Teacher Management"
              icon="fas fa-chalkboard-teacher"
              items={[
                {
                  to: "/admin/teachers",
                  text: "All Teachers",
                  icon: "fas fa-list",
                },
                {
                  to: "/admin/qualifications",
                  text: "Qualifications",
                  icon: "fas fa-certificate",
                },
              ]}
            />

            <SidebarLink
              to="/admin/class-requests"
              icon="fas fa-user-plus"
              text="Class Requests"
            />

            {/* Communication */}
            <div className="mt-4 mb-2">
              <h6 className="md:min-w-full text-xs uppercase font-bold block pt-1 pb-2 no-underline text-blueGray-500">
                Communication
              </h6>
            </div>

            <SidebarLink
              to="/admin/calendar"
              icon="fas fa-calendar-alt"
              text="Calendar"
            />

            <SidebarLink
              to="/admin/messages"
              icon="fas fa-envelope"
              text="Messages"
            />

            <SidebarLink
              to="/admin/notifications"
              icon="fas fa-bell"
              text="Notifications"
            />

            <SidebarLink
              to="/admin/feedback"
              icon="fas fa-comment-dots"
              text="Feedback"
            />

            {/* Settings */}
            <div className="mt-4 mb-2">
              <h6 className="md:min-w-full text-xs uppercase font-bold block pt-1 pb-2 no-underline text-blueGray-500">
                System
              </h6>
            </div>

            <SidebarLink
              to="/admin/settings"
              icon="fas fa-cog"
              text="Settings"
            />

            <SidebarLink
              to="/admin/reports"
              icon="fas fa-chart-bar"
              text="Reports"
            />
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;
