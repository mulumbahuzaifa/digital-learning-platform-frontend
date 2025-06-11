// src/pages/admin/users/UserEdit.tsx
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { UserForm } from "../../../components/admin/UserForm";
import { userService } from "../../../services/userService";
import { Card } from '@radix-ui/themes';
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { UserEditFormData } from "../../../types";
import { useUserMutation } from "../../../hooks/useUserMutation";

const UserEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ["user", id],
    queryFn: () => userService.getUserById(id!),
    enabled: !!id,
  });

  const { updateUser } = useUserMutation();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Error loading user</div>;
  if (!user) return <div>User not found</div>;

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-lg font-medium text-gray-900">Edit User</h2>
        </div>
        <UserForm
          mode="edit"
          initialData={user}
          onSubmit={async (data) => {
            await updateUser.mutateAsync({ id: id!, data: data as UserEditFormData });
            navigate("/admin/users");
          }}
          isSubmitting={updateUser.isPending}
        />
      </div>
    </Card>
  );
};

export default UserEdit;