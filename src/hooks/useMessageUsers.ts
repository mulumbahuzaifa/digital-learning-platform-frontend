import { useQuery } from "@tanstack/react-query";
import { userService, GetAllUsersParams } from "../services/userService";
import { User } from "../types";

export const useMessageUsers = (params: GetAllUsersParams) => {
  return useQuery<User[]>({
    queryKey: ["messageUsers", params],
    queryFn: () => userService.getUsersForMessaging(params),
    enabled: Boolean(
      params.role || (params.class && params.subject) || params.class
    ),
  });
};
