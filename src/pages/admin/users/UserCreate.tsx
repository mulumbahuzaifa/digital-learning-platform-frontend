// src/pages/admin/users/UserCreate.tsx
import { useNavigate } from "react-router-dom";
import { UserForm } from "../../../components/admin/UserForm";
import { Card } from '@radix-ui/themes';
import { UserCreateFormData } from "../../../types";
import { useUserMutation } from "../../../hooks/useUserMutation";

const UserCreate = () => {
  const navigate = useNavigate();
  const { createUser } = useUserMutation();

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-lg font-medium text-gray-900">Create New User</h2>
        </div>
        <UserForm
          mode="create"
          onSubmit={async (data) => {
            await createUser.mutateAsync(data as UserCreateFormData);
            navigate("/admin/users");
          }}
          isSubmitting={createUser.isPending}
        />
      </div>
    </Card>
  );
};

export default UserCreate;