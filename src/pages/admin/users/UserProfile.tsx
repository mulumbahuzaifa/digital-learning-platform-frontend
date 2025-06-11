// src/pages/admin/users/UserProfile.tsx
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { userService } from "../../../services/userService";
import { Card } from "../../../components/ui/Card";

const UserProfile = () => {
  const { id } = useParams();

  const { data: user, isLoading } = useQuery({
    queryKey: ["user", id],
    queryFn: () => userService.getUserById(id!),
    enabled: !!id,
  });

  if (isLoading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">User Profile</h1>
      <Card className="p-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-blueGray-500">Name</h3>
            <p>{`${user.firstName} ${user.lastName}`}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-blueGray-500">Email</h3>
            <p>{user.email}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-blueGray-500">Role</h3>
            <p>{user.role}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-blueGray-500">Status</h3>
            <p>{user.isActive ? "Active" : "Inactive"}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default UserProfile;