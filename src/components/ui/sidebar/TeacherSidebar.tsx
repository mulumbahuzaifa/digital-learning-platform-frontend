import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Flex,
  Box,
  Text,
  Separator,
  ScrollArea,
  Avatar,
  Heading,
  Button,
  Tooltip,
} from "@radix-ui/themes";
import {
  HomeIcon,
  PersonIcon,
  BookmarkIcon,
  ReaderIcon,
  CheckCircledIcon,
  CalendarIcon,
  ChatBubbleIcon,
  GearIcon,
  VideoIcon,
  HamburgerMenuIcon,
  Cross2Icon,
  ChevronDownIcon,
  ChevronRightIcon,
} from "@radix-ui/react-icons";
import { useAuth } from "../../../context/AuthProvider";

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  end?: boolean;
}

interface SidebarDropdownProps {
  title: string;
  icon: React.ReactNode;
  items: SidebarLinkProps[];
}

const SidebarDropdown: React.FC<SidebarDropdownProps> = ({
  title,
  icon,
  items,
}) => {
  const location = useLocation();
  const isAnyActive = items.some(
    (item) =>
      location.pathname === item.to || location.pathname.startsWith(item.to)
  );
  const [isOpen, setIsOpen] = useState(isAnyActive);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="mb-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-all duration-200 border ${
          isAnyActive
            ? "bg-blue-100 text-blue-700 border-blue-200"
            : "hover:bg-blue-50 text-gray-700 border-transparent hover:border-blue-200"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 text-blue-600">{icon}</div>
          <span className="whitespace-nowrap font-medium">{title}</span>
        </div>
        <div className="flex-shrink-0">
          {isOpen ? <ChevronDownIcon /> : <ChevronRightIcon />}
        </div>
      </button>

      {isOpen && (
        <div className="pl-4 mt-1 mb-1 space-y-1">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 border ${
                  isActive
                    ? "bg-gradient-to-r from-blue-500 to-blue-400 text-white border-blue-600 shadow-sm"
                    : "hover:bg-blue-50 text-gray-600 border-transparent hover:border-blue-200"
                }`
              }
            >
              <div className="flex-shrink-0 text-sm">{item.icon}</div>
              <span className="whitespace-nowrap text-sm">{item.label}</span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
};

const TeacherSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  // Simple links
  const dashboardLink = {
    label: "Dashboard",
    icon: <HomeIcon width={20} height={20} />,
    to: "/teacher",
    end: true,
  };

  // Dropdowns
  const classManagement = {
    title: "Class Management",
    icon: <BookmarkIcon width={20} height={20} />,
    items: [
      {
        label: "My Classes",
        icon: <BookmarkIcon width={16} height={16} />,
        to: "/teacher/classes",
      },
    ],
  };

  const studentManagement = {
    title: "Student Management",
    icon: <PersonIcon width={20} height={20} />,
    items: [
      {
        label: "All Students",
        icon: <PersonIcon width={16} height={16} />,
        to: "/teacher/students",
      },
    ],
  };

  const assignmentManagement = {
    title: "Assignments",
    icon: <ReaderIcon width={20} height={20} />,
    items: [
      {
        label: "All Assignments",
        icon: <ReaderIcon width={16} height={16} />,
        to: "/teacher/assignments",
      },
      {
        label: "Create Assignment",
        icon: <ReaderIcon width={16} height={16} />,
        to: "/teacher/assignments/create",
      },
    ],
  };

  const contentManagement = {
    title: "Content",
    icon: <ReaderIcon width={20} height={20} />,
    items: [
      {
        label: "All Content",
        icon: <ReaderIcon width={16} height={16} />,
        to: "/teacher/content",
      },
      {
        label: "Create Content",
        icon: <ReaderIcon width={16} height={16} />,
        to: "/teacher/content/create",
      },
    ],
  };

  const liveSessionManagement = {
    title: "Live Sessions",
    icon: <VideoIcon width={20} height={20} />,
    items: [
      {
        label: "All Sessions",
        icon: <VideoIcon width={16} height={16} />,
        to: "/teacher/live-sessions",
      },
      {
        label: "Create Session",
        icon: <VideoIcon width={16} height={16} />,
        to: "/teacher/live-sessions/create",
      },
    ],
  };

  // Simple links
  const simpleLinks = [
    {
      label: "Gradebook",
      icon: <CheckCircledIcon width={20} height={20} />,
      to: "/teacher/gradebook",
    },
    {
      label: "Attendance",
      icon: <CheckCircledIcon width={20} height={20} />,
      to: "/teacher/attendance",
    },
    {
      label: "Calendar",
      icon: <CalendarIcon width={20} height={20} />,
      to: "/teacher/calendar",
    },
    {
      label: "Messages",
      icon: <ChatBubbleIcon width={20} height={20} />,
      to: "/teacher/messages",
    },
  ];

  const accountLinks = [
    {
      label: "Profile",
      icon: <PersonIcon width={20} height={20} />,
      to: "/teacher/profile",
    },
    {
      label: "Settings",
      icon: <GearIcon width={20} height={20} />,
      to: "/teacher/settings",
    },
  ];

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const toggleMobileSidebar = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        className="md:hidden fixed top-4 left-4 z-50"
        variant="soft"
        onClick={toggleMobileSidebar}
        size="2"
      >
        {mobileOpen ? <Cross2Icon /> : <HamburgerMenuIcon />}
      </Button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-white shadow-lg z-40
          transition-all duration-300 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"} 
          ${collapsed ? "w-20" : "w-64"}
          md:translate-x-0
        `}
      >
        <Flex
          direction="column"
          className="h-full"
          style={{ borderRight: "1px solid var(--gray-5)" }}
        >
          {/* Header with Logo */}
          <Box p="4" className="border-b border-gray-200">
            <Flex align="center" justify="between" gap="3">
              {!collapsed && (
                <Heading size="5" className="text-blue-600">
                  Teacher Portal
                </Heading>
              )}
              <Button
                variant="ghost"
                size="1"
                className="hidden md:flex"
                onClick={toggleSidebar}
              >
                {collapsed ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                )}
              </Button>
            </Flex>
          </Box>

          {/* User Profile */}
          <Box p="4" className="border-b border-gray-200">
            <Flex
              align="center"
              gap="3"
              justify={collapsed ? "center" : "start"}
            >
              <Avatar
                size={collapsed ? "3" : "4"}
                src={user?.profile?.avatar || undefined}
                fallback={
                  user?.firstName && user?.lastName
                    ? `${user.firstName[0]}${user.lastName[0]}`
                    : "T"
                }
                radius="full"
              />
              {!collapsed && (
                <Box>
                  <Text weight="bold">
                    {user?.firstName} {user?.lastName}
                  </Text>
                  <Text size="1" className="text-gray-500">
                    {user?.role === "teacher" && (
                      <span className="text-gray-500 ml-2">(Teacher)</span>
                    )}
                  </Text>
                </Box>
              )}
            </Flex>
          </Box>

          {/* Navigation */}
          <ScrollArea className="flex-grow" type="hover">
            <Box p="2">
              {/* Dashboard Link */}
              {!collapsed ? (
                <NavLink
                  to={dashboardLink.to}
                  end={dashboardLink.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 border mb-2 ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white border-blue-700 shadow-md"
                        : "hover:bg-blue-50 text-gray-700 border-transparent hover:border-blue-200"
                    }`
                  }
                >
                  <div className="flex-shrink-0">{dashboardLink.icon}</div>
                  <span className="whitespace-nowrap font-medium">
                    {dashboardLink.label}
                  </span>
                </NavLink>
              ) : (
                <Tooltip content="Dashboard" side="right">
                  <NavLink
                    to={dashboardLink.to}
                    end={dashboardLink.end}
                    className={({ isActive }) =>
                      `flex items-center justify-center p-3 rounded-lg transition-all duration-200 border mb-2 ${
                        isActive
                          ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white border-blue-700 shadow-md"
                          : "hover:bg-blue-50 text-gray-700 border-transparent hover:border-blue-200"
                      }`
                    }
                  >
                    <div className="flex-shrink-0">{dashboardLink.icon}</div>
                  </NavLink>
                </Tooltip>
              )}

              {/* Section: Academic */}
              <div className="mt-4 mb-2">
                {!collapsed && (
                  <Text
                    size="1"
                    weight="bold"
                    color="gray"
                    className="px-4 uppercase"
                  >
                    Academic
                  </Text>
                )}
                <Separator my="2" size="4" />
              </div>

              {/* Dropdowns or Collapsed Icons */}
              {!collapsed ? (
                <>
                  <SidebarDropdown {...classManagement} />
                  <SidebarDropdown {...studentManagement} />
                  <SidebarDropdown {...assignmentManagement} />
                  <SidebarDropdown {...contentManagement} />
                  <SidebarDropdown {...liveSessionManagement} />
                </>
              ) : (
                <>
                  {/* Collapsed Class Management */}
                  <Tooltip content="Class Management" side="right">
                    <div className="mb-2">
                      <button
                        className={`flex items-center justify-center p-3 rounded-lg transition-all duration-200 border w-full ${
                          location.pathname.includes("/teacher/classes")
                            ? "bg-blue-100 text-blue-700 border-blue-200"
                            : "hover:bg-blue-50 text-gray-700 border-transparent hover:border-blue-200"
                        }`}
                      >
                        {classManagement.icon}
                      </button>
                    </div>
                  </Tooltip>

                  {/* Collapsed Student Management */}
                  <Tooltip content="Student Management" side="right">
                    <div className="mb-2">
                      <button
                        className={`flex items-center justify-center p-3 rounded-lg transition-all duration-200 border w-full ${
                          location.pathname.includes("/teacher/students")
                            ? "bg-blue-100 text-blue-700 border-blue-200"
                            : "hover:bg-blue-50 text-gray-700 border-transparent hover:border-blue-200"
                        }`}
                      >
                        {studentManagement.icon}
                      </button>
                    </div>
                  </Tooltip>

                  {/* Collapsed Assignment Management */}
                  <Tooltip content="Assignments" side="right">
                    <div className="mb-2">
                      <button
                        className={`flex items-center justify-center p-3 rounded-lg transition-all duration-200 border w-full ${
                          location.pathname.includes("/teacher/assignments")
                            ? "bg-blue-100 text-blue-700 border-blue-200"
                            : "hover:bg-blue-50 text-gray-700 border-transparent hover:border-blue-200"
                        }`}
                      >
                        {assignmentManagement.icon}
                      </button>
                    </div>
                  </Tooltip>

                  {/* Collapsed Content Management */}
                  <Tooltip content="Content" side="right">
                    <div className="mb-2">
                      <button
                        className={`flex items-center justify-center p-3 rounded-lg transition-all duration-200 border w-full ${
                          location.pathname.includes("/teacher/content")
                            ? "bg-blue-100 text-blue-700 border-blue-200"
                            : "hover:bg-blue-50 text-gray-700 border-transparent hover:border-blue-200"
                        }`}
                      >
                        {contentManagement.icon}
                      </button>
                    </div>
                  </Tooltip>

                  {/* Collapsed Live Session Management */}
                  <Tooltip content="Live Sessions" side="right">
                    <div className="mb-2">
                      <button
                        className={`flex items-center justify-center p-3 rounded-lg transition-all duration-200 border w-full ${
                          location.pathname.includes("/teacher/live-sessions")
                            ? "bg-blue-100 text-blue-700 border-blue-200"
                            : "hover:bg-blue-50 text-gray-700 border-transparent hover:border-blue-200"
                        }`}
                      >
                        {liveSessionManagement.icon}
                      </button>
                    </div>
                  </Tooltip>
                </>
              )}

              {/* Simple Links */}
              {!collapsed
                ? simpleLinks.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 border mb-2 ${
                          isActive
                            ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white border-blue-700 shadow-md"
                            : "hover:bg-blue-50 text-gray-700 border-transparent hover:border-blue-200"
                        }`
                      }
                    >
                      <div className="flex-shrink-0">{item.icon}</div>
                      <span className="whitespace-nowrap font-medium">
                        {item.label}
                      </span>
                    </NavLink>
                  ))
                : simpleLinks.map((item) => (
                    <Tooltip key={item.to} content={item.label} side="right">
                      <NavLink
                        to={item.to}
                        className={({ isActive }) =>
                          `flex items-center justify-center p-3 rounded-lg transition-all duration-200 border mb-2 ${
                            isActive
                              ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white border-blue-700 shadow-md"
                              : "hover:bg-blue-50 text-gray-700 border-transparent hover:border-blue-200"
                          }`
                        }
                      >
                        <div className="flex-shrink-0">{item.icon}</div>
                      </NavLink>
                    </Tooltip>
                  ))}

              {/* Section: Account */}
              <div className="mt-4 mb-2">
                {!collapsed && (
                  <Text
                    size="1"
                    weight="bold"
                    color="gray"
                    className="px-4 uppercase"
                  >
                    Account
                  </Text>
                )}
                <Separator my="2" size="4" />
              </div>

              {/* Account Links */}
              {!collapsed
                ? accountLinks.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 border mb-2 ${
                          isActive
                            ? "bg-gradient-to-r from-gray-600 to-gray-500 text-white border-gray-700 shadow-md"
                            : "hover:bg-gray-50 text-gray-700 border-transparent hover:border-gray-200"
                        }`
                      }
                    >
                      <div className="flex-shrink-0">{item.icon}</div>
                      <span className="whitespace-nowrap font-medium">
                        {item.label}
                      </span>
                    </NavLink>
                  ))
                : accountLinks.map((item) => (
                    <Tooltip key={item.to} content={item.label} side="right">
                      <NavLink
                        to={item.to}
                        className={({ isActive }) =>
                          `flex items-center justify-center p-3 rounded-lg transition-all duration-200 border mb-2 ${
                            isActive
                              ? "bg-gradient-to-r from-gray-600 to-gray-500 text-white border-gray-700 shadow-md"
                              : "hover:bg-gray-50 text-gray-700 border-transparent hover:border-gray-200"
                          }`
                        }
                      >
                        <div className="flex-shrink-0">{item.icon}</div>
                      </NavLink>
                    </Tooltip>
                  ))}
            </Box>
          </ScrollArea>

          {/* Footer */}
          <Box p="3" className="border-t border-gray-200">
            <Flex
              align="center"
              justify={collapsed ? "center" : "between"}
              gap="3"
            >
              {!collapsed && <Text size="1">© 2023 Learning Platform</Text>}
              <Button
                variant="soft"
                color="gray"
                size="1"
                onClick={() => {
                  // Handle logout
                }}
              >
                {collapsed ? "Exit" : "Logout"}
              </Button>
            </Flex>
          </Box>
        </Flex>
      </aside>
    </>
  );
};

export default TeacherSidebar;
