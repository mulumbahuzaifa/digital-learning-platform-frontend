import { useAuth } from "../../context/AuthProvider";
import { useAuthActions } from "../../hooks/useAuthActions";
import {
  Box,
  Flex,
  Text,
  Avatar,
  DropdownMenu,
  Button,
} from "@radix-ui/themes";
import { Link, useLocation } from "react-router-dom";
import {
  ReaderIcon,
  CalendarIcon,
  FileTextIcon,
  StarIcon,
  PersonIcon,
  ExitIcon,
} from "@radix-ui/react-icons";

const StudentNav = () => {
  const { user } = useAuth();
  const { currentUser, logout } = useAuthActions();
  const location = useLocation();

  const navItems = [
    {
      label: "Dashboard",
      path: "/student/dashboard",
      icon: <ReaderIcon width={20} height={20} />,
    },
    {
      label: "Classes",
      path: "/student/classes",
      icon: <ReaderIcon width={20} height={20} />,
    },
    {
      label: "Assignments",
      path: "/student/assignments",
      icon: <FileTextIcon width={20} height={20} />,
    },
    {
      label: "Grades",
      path: "/student/grades",
      icon: <StarIcon width={20} height={20} />,
    },
    {
      label: "Content",
      path: "/student/content",
      icon: <ReaderIcon width={20} height={20} />,
    },
    {
      label: "Calendar",
      path: "/student/calendar",
      icon: <CalendarIcon width={20} height={20} />,
    },
    {
      label: "Attendance",
      path: "/student/attendance",
      icon: <CalendarIcon width={20} height={20} />,
    },
  ];

  return (
    <Box style={{ borderBottom: "1px solid var(--gray-5)" }}>
      <Flex justify="between" align="center" p="4">
        <Flex gap="4" align="center">
          <Link to="/student/dashboard" style={{ textDecoration: "none" }}>
            <Text size="5" weight="bold" color="blue">
              Student Portal
            </Text>
          </Link>
          <Flex gap="2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                style={{ textDecoration: "none" }}
              >
                <Button
                  variant={location.pathname === item.path ? "solid" : "ghost"}
                  color={location.pathname === item.path ? "blue" : "gray"}
                >
                  <Flex gap="2" align="center">
                    {item.icon}
                    <Text>{item.label}</Text>
                  </Flex>
                </Button>
              </Link>
            ))}
          </Flex>
        </Flex>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Button variant="ghost">
              <Flex gap="2" align="center">
                <Avatar
                  size="2"
                  src={currentUser.data?.profile?.avatar}
                  fallback={currentUser.data?.firstName?.[0] || "U"}
                />
                <Text>{currentUser.data?.firstName}</Text>
              </Flex>
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item asChild>
              <Link to="/student/profile" style={{ textDecoration: "none" }}>
                <Flex gap="2" align="center">
                  <PersonIcon />
                  <Text>Profile</Text>
                </Flex>
              </Link>
            </DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item color="red" onClick={logout}>
              <Flex gap="2" align="center">
                <ExitIcon />
                <Text>Logout</Text>
              </Flex>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </Flex>
    </Box>
  );
};

export default StudentNav;
