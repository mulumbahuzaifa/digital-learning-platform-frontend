import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Flex,
  Heading,
  Box,
  TextArea,
  Select,
  Button,
} from "@radix-ui/themes";
import { useMessageMutation } from "../../../hooks/useMessageMutation";
import { useQuery } from "@tanstack/react-query";
import { classService } from "../../../services/classService";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { StudentClass, TeacherClass } from "../../../types/class";
import { User } from "../../../types";
import { useMessageUsers } from "../../../hooks/useMessageUsers";
import {
  useSubjects,
  useSubjectTeachers,
} from "../../../hooks/useSubjectMutation";

const ComposeMessage = () => {
  const navigate = useNavigate();
  const { createMessage } = useMessageMutation();
  const [messageType, setMessageType] = useState<
    "direct" | "class" | "subject"
  >("direct");
  const [recipient, setRecipient] = useState("");
  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [content, setContent] = useState("");

  // Reset recipient when message type changes
  useEffect(() => {
    setRecipient("");
  }, [messageType]);

  const { data: classes = [], isLoading: isLoadingClasses } = useQuery({
    queryKey: ["classes"],
    queryFn: () => classService.getMyClasses(),
  });

  // Use the new subject hooks
  const { data: subjectsData, isLoading: isLoadingSubjects } = useSubjects();
  const subjects = subjectsData?.data || [];

  // Get subject teachers when subject is selected
  const { data: subjectTeachersData, isLoading: isLoadingSubjectTeachers } =
    useSubjectTeachers(subjectId);
  const subjectTeachers = subjectTeachersData?.data || [];

  // Use the message users hook for direct messages
  const { data: users = [], isLoading: isLoadingUsers } = useMessageUsers({
    role: messageType === "direct" ? "teacher" : undefined,
    class:
      messageType === "class" || messageType === "subject"
        ? classId
        : undefined,
    subject: messageType === "subject" ? subjectId : undefined,
  });

  const isLoading =
    isLoadingClasses ||
    isLoadingSubjects ||
    isLoadingUsers ||
    isLoadingSubjectTeachers;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const messageData = {
      content,
      ...(messageType === "direct" && { recipient }),
      ...(messageType === "class" && { class: classId }),
      ...(messageType === "subject" && { subject: subjectId, class: classId }),
    };

    await createMessage.mutateAsync(messageData);
    navigate("/student/messages");
  };

  const isStudentClass = (
    class_: StudentClass | TeacherClass
  ): class_ is StudentClass => {
    return (
      "academicYear" in class_ && "term" in class_ && "enrollmentDate" in class_
    );
  };

  const renderClassOption = (class_: StudentClass | TeacherClass) => {
    if (isStudentClass(class_)) {
      return (
        <Select.Item key={class_._id} value={class_._id}>
          {class_.name} ({class_.level} {class_.stream})
        </Select.Item>
      );
    }
    return null;
  };

  return (
    <Box p="4">
      <Card size="3">
        <form onSubmit={handleSubmit}>
          <Flex direction="column" gap="4">
            <Heading size="5">Compose Message</Heading>

            <Select.Root
              value={messageType}
              onValueChange={(value) =>
                setMessageType(value as typeof messageType)
              }
            >
              <Select.Trigger placeholder="Select message type" />
              <Select.Content>
                <Select.Item value="direct">Direct Message</Select.Item>
                <Select.Item value="class">Class Message</Select.Item>
                <Select.Item value="subject">Subject Message</Select.Item>
              </Select.Content>
            </Select.Root>

            {messageType === "direct" && (
              <Select.Root value={recipient} onValueChange={setRecipient}>
                <Select.Trigger placeholder="Select recipient" />
                <Select.Content>
                  {users.map((user: User) => (
                    <Select.Item key={user._id} value={user._id}>
                      {user.firstName} {user.lastName} ({user.role})
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            )}

            {messageType === "class" && (
              <Select.Root value={classId} onValueChange={setClassId}>
                <Select.Trigger placeholder="Select class" />
                <Select.Content>
                  {classes.map(renderClassOption)}
                </Select.Content>
              </Select.Root>
            )}

            {messageType === "subject" && (
              <>
                <Select.Root value={classId} onValueChange={setClassId}>
                  <Select.Trigger placeholder="Select class" />
                  <Select.Content>
                    {classes.map(renderClassOption)}
                  </Select.Content>
                </Select.Root>

                <Select.Root value={subjectId} onValueChange={setSubjectId}>
                  <Select.Trigger placeholder="Select subject" />
                  <Select.Content>
                    {subjects.map((subject) => (
                      <Select.Item key={subject._id} value={subject._id}>
                        {subject.name} ({subject.code})
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>

                {subjectId && (
                  <Select.Root value={recipient} onValueChange={setRecipient}>
                    <Select.Trigger placeholder="Select teacher" />
                    <Select.Content>
                      {subjectTeachers.map((teacher: User) => (
                        <Select.Item key={teacher._id} value={teacher._id}>
                          {teacher.firstName} {teacher.lastName}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                )}
              </>
            )}

            <TextArea
              placeholder="Type your message..."
              value={content}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setContent(e.target.value)
              }
              style={{ minHeight: "150px" }}
            />

            <Flex gap="3" justify="end">
              <Button
                variant="soft"
                color="gray"
                onClick={() => navigate("/student/messages")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!content.trim()}>
                Send Message
              </Button>
            </Flex>
          </Flex>
        </form>
      </Card>
    </Box>
  );
};

export default ComposeMessage;
