import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  Text,
  Switch,
  Box,
} from "@radix-ui/themes";
import { useQuery } from "@tanstack/react-query";
import { liveSessionService } from "../../../services/liveSessionService";
import { useLiveSessionMutation } from "../../../hooks/useLiveSessionMutation";
import { UpdateLiveSessionData } from "../../../types";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import DateTimePicker from "react-datetime-picker";
import "react-datetime-picker/dist/DateTimePicker.css";
import "react-calendar/dist/Calendar.css";
import "react-clock/dist/Clock.css";

// Define schema for form validation
const editLiveSessionSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title cannot exceed 100 characters"),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
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

type FormValues = z.infer<typeof editLiveSessionSchema>;

const EditLiveSession = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: session,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["live-session", id],
    queryFn: () => liveSessionService.getLiveSessionById(id!),
    enabled: !!id,
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(editLiveSessionSchema),
  });

  const { updateLiveSession } = useLiveSessionMutation();

  // Set form default values when session data is loaded
  useEffect(() => {
    if (session) {
      reset({
        title: session.title,
        description: session.description || "",
        startTime: new Date(session.startTime),
        duration: session.duration,
        enableChat: session.settings?.enableChat ?? true,
        enableRecording: session.settings?.enableRecording ?? true,
        enableScreenSharing: session.settings?.enableScreenSharing ?? true,
      });
    }
  }, [session, reset]);

  const onSubmit = (data: FormValues) => {
    if (!id) return;

    const updateData: UpdateLiveSessionData = {
      title: data.title,
      description: data.description,
      startTime: data.startTime.toISOString(),
      duration: data.duration,
      settings: {
        enableChat: data.enableChat,
        enableRecording: data.enableRecording,
        enableScreenSharing: data.enableScreenSharing,
      },
    };

    updateLiveSession.mutate(
      { id, data: updateData },
      {
        onSuccess: () => {
          navigate("/teacher/live-sessions");
        },
      }
    );
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <Text>Error loading session</Text>;
  if (!session) return <Text>Session not found</Text>;

  // Cannot edit sessions that have already started
  if (session.status !== "scheduled") {
    return (
      <Card size="4">
        <Flex direction="column" gap="4" align="center">
          <Heading size="5">Cannot Edit Session</Heading>
          <Text>
            You cannot edit a session that has already started or ended.
          </Text>
          <Button
            onClick={() => navigate("/teacher/live-sessions")}
            variant="soft"
          >
            Back to Sessions
          </Button>
        </Flex>
      </Card>
    );
  }

  return (
    <Card size="4">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Flex direction="column" gap="4">
          <Heading as="h2" size="5">
            Edit Live Session
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
              Class
            </Text>
            <TextField.Root
              value={
                typeof session.class === "object"
                  ? session.class.name
                  : "Loading..."
              }
              disabled
            />
            <Text size="1" color="gray">
              Class cannot be changed after creation
            </Text>
          </Flex>

          <Flex direction="column" gap="2">
            <Text as="label" size="2" weight="bold">
              Subject
            </Text>
            <TextField.Root
              value={
                typeof session.subject === "object"
                  ? session.subject.name
                  : "Loading..."
              }
              disabled
            />
            <Text size="1" color="gray">
              Subject cannot be changed after creation
            </Text>
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

          <Box my="2">
            <Heading as="h3" size="3" mb="2">
              Session Settings
            </Heading>
            <Flex direction="column" gap="3">
              <Flex align="center" justify="between">
                <Text as="label" size="2">
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
                <Text as="label" size="2">
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
                <Text as="label" size="2">
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
          </Box>

          <Flex gap="3" mt="4" justify="end">
            <Button
              type="button"
              variant="soft"
              color="gray"
              onClick={() => navigate("/teacher/live-sessions")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateLiveSession.isPending}>
              {updateLiveSession.isPending ? "Updating..." : "Update Session"}
            </Button>
          </Flex>
        </Flex>
      </form>
    </Card>
  );
};

export default EditLiveSession;
