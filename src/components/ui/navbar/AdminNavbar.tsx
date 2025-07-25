import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthProvider";
import { Avatar, Box, DropdownMenu, Flex, Text } from "@radix-ui/themes";
import {
  ExitIcon,
  GearIcon,
  PersonIcon,
  BellIcon,
  EnvelopeClosedIcon,
} from "@radix-ui/react-icons";

export default function AdminNavbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-10 bg-white border-b border-gray-200">
      <div className="px-3 py-3 lg:px-5 lg:pl-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-start">
            <Link to="/admin" className="lg:ml-2 flex items-center">
              <span className="self-center text-xl font-bold text-blue-700 whitespace-nowrap ml-2">
                NEWSOMA
              </span>
            </Link>
          </div>

          <Flex gap="5" align="center">
            {/* Notifications */}
            <Box className="relative">
              <Link to="/admin/notifications">
                <BellIcon
                  width="20"
                  height="20"
                  className="text-gray-600 hover:text-blue-600"
                />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  3
                </span>
              </Link>
            </Box>

            {/* Messages */}
            <Box className="relative">
              <Link to="/admin/messages">
                <EnvelopeClosedIcon
                  width="20"
                  height="20"
                  className="text-gray-600 hover:text-blue-600"
                />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  5
                </span>
              </Link>
            </Box>

            {/* User Menu */}
            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                <Flex
                  align="center"
                  gap="2"
                  style={{ cursor: "pointer" }}
                  className="hover:bg-gray-100 p-1 rounded"
                >
                  <Avatar
                    src={user?.profile?.avatar || ""}
                    fallback={user?.firstName?.charAt(0) || "U"}
                    size="2"
                    radius="full"
                    color="indigo"
                  />
                  <Box>
                    <Text size="2" weight="medium" className="text-gray-700">
                      {user?.firstName} {user?.lastName}
                    </Text>
                    <Text size="1" className="text-gray-500">
                      {user?.role === "admin" && (
                        <span className="text-gray-500 ml-2">(Admin)</span>
                      )}
                      {user?.role === "teacher" && (
                        <span className="text-gray-500 ml-2">(Teacher)</span>
                      )}
                      {user?.role === "student" && (
                        <span className="text-gray-500 ml-2">(Student)</span>
                      )}
                    </Text>
                  </Box>
                </Flex>
              </DropdownMenu.Trigger>

              <DropdownMenu.Content>
                <DropdownMenu.Item>
                  <Link
                    to="/admin/profile"
                    className="flex items-center gap-2 w-full"
                  >
                    <PersonIcon />
                    Profile
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item>
                  <Link
                    to="/admin/settings"
                    className="flex items-center gap-2 w-full"
                  >
                    <GearIcon />
                    Settings
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Separator />
                <DropdownMenu.Item color="red" onClick={logout}>
                  <Flex gap="2" align="center">
                    <ExitIcon />
                    Logout
                  </Flex>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </Flex>
        </div>
      </div>
    </nav>
  );
}
