import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  Flex,
  Heading,
  Button,
  TextField,
  TextArea,
  Select,
  Text,
  Switch,
} from "@radix-ui/themes";
import { useQuery } from "@tanstack/react-query";
import { classService } from "../../../services/classService";
import { useLiveSessionMutation } from "../../../hooks/useLiveSessionMutation";
import { CreateLiveSessionData } from "../../../types";
import { Class } from "../../../types/class";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import DateTimePicker from "react-datetime-picker";
import "react-datetime-picker/dist/DateTimePicker.css";
import "react-calendar/dist/Calendar.css";
import "react-clock/dist/Clock.css";

// Define schema for form validation
const createLiveSessionSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title cannot exceed 100 characters"),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
  class: z.string().min(1, "Please select a class"),
  subject: z.string().min(1, "Please select a subject"),
  startTime: z.date().refine((date) => date > new Date(), {
    message: "Start time must be in the future",
  }),
  duration: z
    .number()
    .min(1, "Duration must be at least 1 minute")
    .max(480, "Duration cannot exceed 8 hours (480 minutes)"),
  enableChat: z.boolean().default(true),
  enableRecording: z.boolean().default(true),
  enableScreenSharing: z.boolean().default(true),
});

type FormValues = z.infer<typeof createLiveSessionSchema>;

// Define minimal interfaces for type safety
interface ClassSubjectData {
  _id: string;
  name: string;
  code?: string;
}

interface ClassData {
  class: {
    _id: string;
    name: string;
    code?: string;
    level?: string;
    stream?: string;
  };
  enrolledStudents: Array<{
    enrollmentDetails?: {
      subjects?: Array<{
        subject: ClassSubjectData;
      }>;
    };
  }>;
}

const CreateLiveSession = () => {
  const navigate = useNavigate();
  const [selectedClassId, setSelectedClassId] = useState<string>("");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(createLiveSessionSchema),
    defaultValues: {
      enableChat: true,
      enableRecording: true,
      enableScreenSharing: true,
      duration: 60, // Default to 1 hour
    },
  });

  // Fetch classes the teacher is assigned to
  const { data: classes, isLoading: isLoadingClasses } = useQuery<ClassData[]>({
    queryKey: ["teacher-classes"],
    queryFn: () => classService.getMyClasses(),
  });

  // Build classOptions with subjects array for each class
  const classOptions: Class[] = Array.isArray(classes) 
    ? classes.map((item: ClassData) => {
        // Deduplicate subjects for this class
        const subjectMap = new Map<string, ClassSubjectData>();
        item.enrolledStudents?.forEach((enrollment) => {
          enrollment.enrollmentDetails?.subjects?.forEach((subj) => {
            const subject = subj.subject;
            if (subject && subject._id && !subjectMap.has(subject._id)) {
              subjectMap.set(subject._id, subject);
            }
          });
        });
        
        // Return a class object with a subjects array
        return {
          _id: item.class._id,
          name: item.class.name,
          code: item.class.code || "",
          level: item.class.level || "",
          stream: item.class.stream || "",
          subjects: Array.from(subjectMap.values()).map((subject) => ({
            subject: {
              _id: subject._id,
              name: subject.name,
              code: subject.code || "",
            },
            teachers: []
          })),
          prefects: [],
          isActive: true,
          createdAt: "",
          updatedAt: "",
        };
      })
    : [];

  // Get subjects for the selected class
  const availableSubjects = selectedClassId 
    ? classOptions.find(c => c._id === selectedClassId)?.subjects.map(s => ({
        _id: s.subject._id,
        name: s.subject.name,
        code: s.subject.code || "",
        createdAt: new Date(),
        updatedAt: new Date(),
      })) || []
    : [];

  const { createLiveSession } = useLiveSessionMutation();

  const onSubmit = (data: FormValues) => {
    const liveSessionData: CreateLiveSessionData = {
      title: data.title,
      description: data.description,
      class: data.class,
      subject: data.subject,
      startTime: data.startTime.toISOString(),
      duration: data.duration,
      settings: {
        enableChat: data.enableChat,
        enableRecording: data.enableRecording,
        enableScreenSharing: data.enableScreenSharing,
      },
    };

    createLiveSession.mutate(liveSessionData, {
      onSuccess: () => {
        navigate("/teacher/live-sessions");
      },
    });
  };

  const handleClassChange = (classId: string) => {
    setSelectedClassId(classId);
    setValue("class", classId);
    setValue("subject", ""); // Reset subject when class changes
  };

  if (isLoadingClasses) return <LoadingSpinner />;

  return (
    <Card size="4">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Flex direction="column" gap="4">
          <Heading as="h2" size="5">
            Create Live Session
          </Heading>

          <Flex direction="column" gap="2">
            <Text as="label" size="2" weight="bold">
              Title *
            </Text>
            <TextField.Root
              placeholder="Enter session title"
              {...register("title")}
            />
            {errors.title && (
              <Text color="red" size="1">
                {errors.title.message}
              </Text>
            )}
          </Flex>

          <Flex direction="column" gap="2">
            <Text as="label" size="2" weight="bold">
              Description
            </Text>
            <TextArea
              placeholder="Enter session description"
              {...register("description")}
            />
            {errors.description && (
              <Text color="red" size="1">
                {errors.description.message}
              </Text>
            )}
          </Flex>

          <Flex direction="column" gap="2">
            <Text as="label" size="2" weight="bold">
              Class *
            </Text>
            <Select.Root
              onValueChange={handleClassChange}
              value={watch("class")}
            >
              <Select.Trigger placeholder="Select a class" />
              <Select.Content>
                <Select.Group>
                  <Select.Label>Classes</Select.Label>
                  {classOptions.map((cls) => (
                    <Select.Item key={cls._id} value={cls._id}>
                      {cls.name}
                    </Select.Item>
                  ))}
                </Select.Group>
              </Select.Content>
            </Select.Root>
            {errors.class && (
              <Text color="red" size="1">
                {errors.class.message}
              </Text>
            )}
          </Flex>

          <Flex direction="column" gap="2">
            <Text as="label" size="2" weight="bold">
              Subject *
            </Text>
            <Select.Root
              disabled={!selectedClassId || availableSubjects.length === 0}
              onValueChange={(value) => setValue("subject", value)}
              value={watch("subject")}
            >
              <Select.Trigger placeholder={
                !selectedClassId 
                  ? "Select a class first" 
                  : availableSubjects.length === 0
                    ? "No subjects available"
                    : "Select a subject"
              } />
              <Select.Content>
                <Select.Group>
                  <Select.Label>Subjects</Select.Label>
                  {availableSubjects.map((subject) => (
                    <Select.Item
                      key={subject._id}
                      value={subject._id}
                    >
                      {subject.name} {subject.code ? `(${subject.code})` : ''}
                    </Select.Item>
                  ))}
                </Select.Group>
              </Select.Content>
            </Select.Root>
            {errors.subject && (
              <Text color="red" size="1">
                {errors.subject.message}
              </Text>
            )}
          </Flex>

          <Flex direction="column" gap="2">
            <Text as="label" size="2" weight="bold">
              Start Time *
            </Text>
            <Controller
              control={control}
              name="startTime"
              render={({ field }) => (
                <DateTimePicker
                  onChange={field.onChange}
                  value={field.value}
                  minDate={new Date()}
                  className="w-full"
                />
              )}
            />
            {errors.startTime && (
              <Text color="red" size="1">
                {errors.startTime.message}
              </Text>
            )}
          </Flex>

          <Flex direction="column" gap="2">
            <Text as="label" size="2" weight="bold">
              Duration (minutes) *
            </Text>
            <TextField.Root
              type="number"
              placeholder="Enter duration in minutes"
              {...register("duration", { valueAsNumber: true })}
            />
            {errors.duration && (
              <Text color="red" size="1">
                {errors.duration.message}
              </Text>
            )}
          </Flex>

          <Heading size="4">Session Settings</Heading>

          <Flex direction="column" gap="3">
            <Flex align="center" justify="between">
              <Text as="label" size="2" weight="bold">
                Enable Chat
              </Text>
              <Controller
                control={control}
                name="enableChat"
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </Flex>

            <Flex align="center" justify="between">
              <Text as="label" size="2" weight="bold">
                Enable Recording
              </Text>
              <Controller
                control={control}
                name="enableRecording"
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </Flex>

            <Flex align="center" justify="between">
              <Text as="label" size="2" weight="bold">
                Enable Screen Sharing
              </Text>
              <Controller
                control={control}
                name="enableScreenSharing"
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </Flex>
          </Flex>

          <Flex gap="3" mt="4" justify="end">
            <Button
              type="button"
              variant="soft"
              onClick={() => navigate("/teacher/live-sessions")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createLiveSession.isPending}>
              {createLiveSession.isPending ? "Creating..." : "Create Session"}
            </Button>
          </Flex>
        </Flex>
      </form>
    </Card>
  );
};

export default CreateLiveSession;
