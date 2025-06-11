import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthProvider";
import { Avatar, Box, DropdownMenu, Flex, Text } from '@radix-ui/themes';
import { ExitIcon, GearIcon, PersonIcon, BellIcon, EnvelopeClosedIcon } from '@radix-ui/react-icons';

export default function AdminNavbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-10 bg-white border-b border-gray-200">
      <div className="px-3 py-3 lg:px-5 lg:pl-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-start">
            <button 
              type="button" 
              className="lg:hidden inline-flex items-center p-2 text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
              onClick={() => document.body.classList.toggle('g-sidenav-pinned')}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"></path>
              </svg>
            </button>
            <Link to="/admin" className="lg:ml-2 flex items-center">
              <span className="self-center text-xl font-bold text-blue-700 whitespace-nowrap ml-2">NEWSOMA</span>
            </Link>
          </div>
          
          <Flex gap="5" align="center">
            {/* Notifications */}
            <Box className="relative">
              <Link to="/admin/notifications">
                <BellIcon width="20" height="20" className="text-gray-600 hover:text-blue-600" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  3
                </span>
              </Link>
            </Box>
            
            {/* Messages */}
            <Box className="relative">
              <Link to="/admin/messages">
                <EnvelopeClosedIcon width="20" height="20" className="text-gray-600 hover:text-blue-600" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  5
                </span>
              </Link>
            </Box>
            
            {/* User Menu */}
            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                <Flex align="center" gap="2" style={{ cursor: 'pointer' }} className="hover:bg-gray-100 p-1 rounded">
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
                      {user?.role}
                    </Text>
                  </Box>
                </Flex>
              </DropdownMenu.Trigger>
              
              <DropdownMenu.Content>
                <DropdownMenu.Item>
                  <Link to="/admin/profile" className="flex items-center gap-2 w-full">
                    <PersonIcon />
                    Profile
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item>
                  <Link to="/admin/settings" className="flex items-center gap-2 w-full">
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