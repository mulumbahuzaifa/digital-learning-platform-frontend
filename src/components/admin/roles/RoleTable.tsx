// src/components/admin/roles/RoleTable.tsx
import { Table, Select } from '@radix-ui/themes';
import { ChevronDownIcon, CheckIcon } from '@radix-ui/react-icons';
import type { User, UserRole } from '../../../types';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

interface RoleTableProps {
  users: User[];
  onRoleChange: (userId: string, newRole: UserRole) => void;
  isUpdating: boolean;
}

const RoleTable = ({ users, onRoleChange, isUpdating }: RoleTableProps) => {
  return (
    <div className="overflow-hidden border border-gray-700 rounded-lg">
      <Table.Root className="w-full" variant="surface">
        <Table.Header>
          <Table.Row className="border-b border-gray-700 bg-gray-400">
            <Table.ColumnHeaderCell className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
              User
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
              Email
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
              Current Role
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
              Change Role
            </Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body className="bg-gray-100 divide-y divide-gray-200">
          {users.map((user) => (
            <Table.Row key={user._id} className="hover:bg-gray-50">
              <Table.RowHeaderCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {user.firstName} {user.lastName}
              </Table.RowHeaderCell>
              <Table.Cell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {user.email}
              </Table.Cell>
              <Table.Cell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                  user.role === 'teacher' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {user.role}
                </span>
              </Table.Cell>
              <Table.Cell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {isUpdating ? (
                  <LoadingSpinner />
                ) : (
                    <Select.Root
                    value={user.role}
                    onValueChange={(value: UserRole) => onRoleChange(user._id, value)}
                  >
                    <Select.Trigger color="tomato" variant="soft" />
                    <Select.Content color="tomato">
                      <Select.Group>
                        <Select.Label>User Roles</Select.Label>
                        <Select.Item value="admin">Admin</Select.Item>
                        <Select.Item value="teacher">Teacher</Select.Item>
                        <Select.Item value="student">Student</Select.Item>
                      </Select.Group>
                    </Select.Content>
                  </Select.Root>
                )}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </div>
  );
};

export default RoleTable;