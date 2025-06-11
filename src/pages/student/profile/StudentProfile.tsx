import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  Flex,
  Grid,
  Heading,
  Text,
  Box,
  Button,
  Avatar,
  TextField,
  TextArea,
  Select,
  Tabs,
} from "@radix-ui/themes";
import { useAuthActions } from "../../../hooks/useAuthActions";
import { userService } from "../../../services/userService";
import { classService } from "../../../services/classService";
import { gradebookService } from "../../../services/gradebookService";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { toast } from "react-hot-toast";
import { formatDate } from "../../../utils/dateUtils";

const StudentProfile = () => {
  const { currentUser } = useAuthActions();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: currentUser.data?.firstName || "",
    lastName: currentUser.data?.lastName || "",
    email: currentUser.data?.email || "",
    phone: currentUser.data?.profile?.phone || "",
    dateOfBirth: currentUser.data?.profile?.dateOfBirth || "",
    gender: currentUser.data?.profile?.gender || "",
    bio: currentUser.data?.profile?.bio || "",
  });

  // Fetch student's class
  const { data: studentClass, isLoading: isLoadingClass } = useQuery({
    queryKey: ["student-class"],
    queryFn: () => classService.getMyClass(),
  });

  // Fetch student's gradebook
  const { data: gradebook, isLoading: isLoadingGradebook } = useQuery({
    queryKey: ["student-gradebook"],
    queryFn: () => gradebookService.getMyGradebook(),
  });

  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: (data: typeof formData) => userService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      toast.success("Profile updated successfully");
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(formData);
  };

  if (isLoadingClass || isLoadingGradebook) {
    return <LoadingSpinner />;
  }

  return (
    <Box p="4">
      <Grid columns={{ initial: "1", md: "3" }} gap="4">
        {/* Profile Card */}
        <Card size="3">
          <Flex direction="column" gap="4">
            <Flex gap="4" align="center">
              <Avatar
                size="6"
                src={currentUser.data?.profile?.avatar}
                fallback={currentUser.data?.firstName?.[0]}
              />
              <Box>
                <Heading size="5">
                  {currentUser.data?.firstName} {currentUser.data?.lastName}
                </Heading>
                <Text color="gray" size="2">
                  {currentUser.data?.email}
                </Text>
              </Box>
            </Flex>

            <Tabs.Root defaultValue="personal">
              <Tabs.List>
                <Tabs.Trigger value="personal">Personal Info</Tabs.Trigger>
                <Tabs.Trigger value="academic">Academic Info</Tabs.Trigger>
              </Tabs.List>

              <Box pt="4">
                <Tabs.Content value="personal">
                  {isEditing ? (
                    <form onSubmit={handleSubmit}>
                      <Flex direction="column" gap="3">
                        <Grid columns="2" gap="3">
                          <TextField.Root>
                            <TextField.Input
                              placeholder="First Name"
                              value={formData.firstName}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  firstName: e.target.value,
                                })
                              }
                            />
                          </TextField.Root>
                          <TextField.Root>
                            <TextField.Input
                              placeholder="Last Name"
                              value={formData.lastName}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  lastName: e.target.value,
                                })
                              }
                            />
                          </TextField.Root>
                        </Grid>

                        <TextField.Root>
                          <TextField.Input
                            placeholder="Email"
                            value={formData.email}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                email: e.target.value,
                              })
                            }
                          />
                        </TextField.Root>

                        <TextField.Root>
                          <TextField.Input
                            placeholder="Phone"
                            value={formData.phone}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                phone: e.target.value,
                              })
                            }
                          />
                        </TextField.Root>

                        <TextField.Root>
                          <TextField.Input
                            type="date"
                            value={formData.dateOfBirth}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                dateOfBirth: e.target.value,
                              })
                            }
                          />
                        </TextField.Root>

                        <Select.Root
                          value={formData.gender}
                          onValueChange={(value) =>
                            setFormData({ ...formData, gender: value })
                          }
                        >
                          <Select.Trigger placeholder="Select gender" />
                          <Select.Content>
                            <Select.Item value="male">Male</Select.Item>
                            <Select.Item value="female">Female</Select.Item>
                            <Select.Item value="other">Other</Select.Item>
                          </Select.Content>
                        </Select.Root>

                        <TextArea
                          placeholder="Bio"
                          value={formData.bio}
                          onChange={(e) =>
                            setFormData({ ...formData, bio: e.target.value })
                          }
                        />

                        <Flex gap="3" justify="end">
                          <Button
                            variant="soft"
                            color="gray"
                            onClick={() => setIsEditing(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={updateProfile.isPending}
                          >
                            {updateProfile.isPending
                              ? "Saving..."
                              : "Save Changes"}
                          </Button>
                        </Flex>
                      </Flex>
                    </form>
                  ) : (
                    <Flex direction="column" gap="3">
                      <Box>
                        <Text size="2" color="gray">
                          Phone
                        </Text>
                        <Text>{formData.phone || "Not provided"}</Text>
                      </Box>
                      <Box>
                        <Text size="2" color="gray">
                          Date of Birth
                        </Text>
                        <Text>
                          {formData.dateOfBirth
                            ? formatDate(formData.dateOfBirth)
                            : "Not provided"}
                        </Text>
                      </Box>
                      <Box>
                        <Text size="2" color="gray">
                          Gender
                        </Text>
                        <Text>
                          {formData.gender
                            ? formData.gender.charAt(0).toUpperCase() +
                              formData.gender.slice(1)
                            : "Not provided"}
                        </Text>
                      </Box>
                      <Box>
                        <Text size="2" color="gray">
                          Bio
                        </Text>
                        <Text>{formData.bio || "No bio provided"}</Text>
                      </Box>
                      <Button onClick={() => setIsEditing(true)}>
                        Edit Profile
                      </Button>
                    </Flex>
                  )}
                </Tabs.Content>

                <Tabs.Content value="academic">
                  <Flex direction="column" gap="4">
                    <Box>
                      <Text size="2" color="gray">
                        Current Class
                      </Text>
                      <Text>{studentClass?.name || "Not assigned"}</Text>
                    </Box>

                    <Box>
                      <Text size="2" color="gray">
                        Student ID
                      </Text>
                      <Text>
                        {currentUser.data?.profile?.studentId || "Not assigned"}
                      </Text>
                    </Box>

                    {gradebook && (
                      <Box>
                        <Text size="2" color="gray" mb="2">
                          Academic Performance
                        </Text>
                        <Grid columns="2" gap="3">
                          {gradebook.subjects.map((subject) => (
                            <Card key={subject._id} size="2">
                              <Flex direction="column" gap="1">
                                <Text weight="bold">{subject.name}</Text>
                                <Text size="5" color="blue">
                                  {subject.grade || "N/A"}
                                </Text>
                                <Text size="1" color="gray">
                                  {subject.percentage}% Complete
                                </Text>
                              </Flex>
                            </Card>
                          ))}
                        </Grid>
                      </Box>
                    )}
                  </Flex>
                </Tabs.Content>
              </Box>
            </Tabs.Root>
          </Flex>
        </Card>

        {/* Parent/Guardian Information */}
        <Card size="3">
          <Heading size="4" mb="3">
            Parent/Guardian Information
          </Heading>
          <Flex direction="column" gap="3">
            <Box>
              <Text size="2" color="gray">
                Name
              </Text>
              <Text>
                {currentUser.data?.profile?.parentGuardian?.name ||
                  "Not provided"}
              </Text>
            </Box>
            <Box>
              <Text size="2" color="gray">
                Contact
              </Text>
              <Text>
                {currentUser.data?.profile?.parentGuardian?.contact ||
                  "Not provided"}
              </Text>
            </Box>
            <Box>
              <Text size="2" color="gray">
                Relationship
              </Text>
              <Text>
                {currentUser.data?.profile?.parentGuardian?.relationship ||
                  "Not provided"}
              </Text>
            </Box>
          </Flex>
        </Card>

        {/* Address Information */}
        <Card size="3">
          <Heading size="4" mb="3">
            Address Information
          </Heading>
          <Flex direction="column" gap="3">
            <Box>
              <Text size="2" color="gray">
                District
              </Text>
              <Text>
                {currentUser.data?.profile?.address?.district || "Not provided"}
              </Text>
            </Box>
            <Box>
              <Text size="2" color="gray">
                County
              </Text>
              <Text>
                {currentUser.data?.profile?.address?.county || "Not provided"}
              </Text>
            </Box>
            <Box>
              <Text size="2" color="gray">
                Sub-County
              </Text>
              <Text>
                {currentUser.data?.profile?.address?.subCounty ||
                  "Not provided"}
              </Text>
            </Box>
          </Flex>
        </Card>
      </Grid>
    </Box>
  );
};

export default StudentProfile;
