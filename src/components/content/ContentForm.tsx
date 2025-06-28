import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Flex,
  Box,
  Button,
  TextField,
  Text,
  TextArea,
  Select,
  Grid,
  Checkbox,
  Callout,
  Card,
  Heading,
} from "@radix-ui/themes";
import { ContentType, Content } from "../../types";
import { InfoCircledIcon } from "@radix-ui/react-icons";

// Content types from backend
const CONTENT_TYPES = [
  "note",
  "assignment",
  "slide",
  "video",
  "audio",
  "document",
  "link",
  "quiz",
] as const;
type FormContentType = (typeof CONTENT_TYPES)[number];

// Access levels from backend
const ACCESS_LEVELS = ["class", "school", "public"] as const;
type FormAccessLevel = (typeof ACCESS_LEVELS)[number];

// File size limit - 50MB
const MAX_FILE_SIZE = 50 * 1024 * 1024;

// Allowed file extensions
const ACCEPTED_FILE_TYPES: Record<ContentType, string[]> = {
  note: [".pdf", ".doc", ".docx", ".txt"],
  assignment: [".pdf", ".doc", ".docx", ".txt"],
  slide: [".pdf", ".ppt", ".pptx"],
  video: [".mp4", ".avi", ".mov", ".wmv"],
  audio: [".mp3", ".wav", ".ogg"],
  document: [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".txt"],
  link: [],
  quiz: [".json"],
};

// Form data interface
interface FormValues {
  title: string;
  description?: string;
  type: FormContentType;
  class: string;
  subject: string;
  tags?: string;
  isPublic: boolean;
  accessLevel: FormAccessLevel;
}

// Extended form data with file for submission
export interface ContentFormData extends Omit<FormValues, "tags"> {
  file?: File;
  tags?: string[];
}

// Schema definition
const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  type: z.enum(CONTENT_TYPES),
  class: z.string().min(1, "Class is required"),
  subject: z.string().min(1, "Subject is required"),
  tags: z.string().optional(),
  isPublic: z.boolean().default(false),
  accessLevel: z.enum(ACCESS_LEVELS).default("class"),
});

interface ContentFormProps {
  mode: "create" | "edit";
  onSubmit: (data: ContentFormData) => Promise<void>;
  initialData?: Content;
  isSubmitting: boolean;
  classes: Array<{
    _id: string;
    name: string;
    subjects?: Array<{
      subject: string | { _id: string };
      teachers?: Array<{ status: string }>;
    }>;
  }>;
  subjects: Array<{ _id: string; name: string; code?: string }>;
}

export const ContentForm = ({
  mode,
  onSubmit,
  initialData,
  isSubmitting,
  classes,
  subjects,
}: ContentFormProps) => {
  const [fileError, setFileError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [availableSubjects, setAvailableSubjects] = useState<
    Array<{ _id: string; name: string; code?: string }>
  >(subjects || []);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      type: (initialData?.type || "document") as FormContentType,
      class:
        typeof initialData?.class === "string"
          ? initialData.class
          : initialData?.class?._id || "",
      subject:
        typeof initialData?.subject === "string"
          ? initialData.subject
          : initialData?.subject?._id || "",
      tags: initialData?.tags?.join(", ") || "",
      isPublic: initialData?.isPublic || false,
      accessLevel: (initialData?.accessLevel || "class") as FormAccessLevel,
    },
  });

  // Watch form values
  const watchType = watch("type");
  const watchClass = watch("class");
  const watchAccessLevel = watch("accessLevel");

  // Update subjects when class changes
  useEffect(() => {
    if (watchClass && classes.length > 0) {
      const selectedClassObj = classes.find((c) => c._id === watchClass);
      console.log(selectedClassObj)
      if (
        selectedClassObj &&
        selectedClassObj.subjects
      ) {
        // Filter subjects based on the selected class and the teacher's authorized subjects
        const authorizedSubjects = [];
        let includesCurrentSubject = false;
        const currentSubject = watch("subject");

        // Loop through each subject in the selected class
        for (const classSubject of selectedClassObj.subjects) {
          const subjects = selectedClassObj.subjects.map(subject => ({
            _id: typeof subject.subject === 'string' ? subject.subject : subject.subject._id,
            name: typeof subject.subject === 'string' ? '' : subject.subject.name,
            code: typeof subject.subject === 'string' ? '' : subject.subject.code
          })).filter(subject => subject.name);
          // Get the subject ID
          const subjectId = subjects._id;

          // Check if this is the currently assigned subject
          if (currentSubject && currentSubject === subjectId) {
            includesCurrentSubject = true;
          }
          console.log(currentSubject)

          // Check if this teacher is assigned to teach this subject
          const isAssignedTeacher =
            classSubject.teachers &&
            classSubject.teachers.some(
              (teacher: { status: string }) => teacher.status === "approved"
            );

          // Find the full subject details from the subjects array
          const subjectDetails = subjects.find((s) => s._id === subjectId);

          // Only include subjects where the teacher is authorized
          if (isAssignedTeacher && subjectDetails) {
            authorizedSubjects.push(subjectDetails);
          }
        }

        // If we're in edit mode and the current subject isn't in the authorized subjects
        // but it is assigned to this content, find and add it to the available subjects
        if (mode === "edit" && currentSubject && !includesCurrentSubject) {
          const subjectDetails = subjects.find((s) => s._id === currentSubject);
          if (subjectDetails) {
            authorizedSubjects.push(subjectDetails);
          }
        }

        setAvailableSubjects(authorizedSubjects);
      } else {
        // Fallback: show all subjects if class has no subject information
        setAvailableSubjects(subjects);
      }
    } else {
      setAvailableSubjects([]);
    }
  }, [watchClass, classes, subjects, mode, watch]);

  // Clear subject selection when class changes (only in create mode)
  useEffect(() => {
    if (mode === "create") {
      setValue("subject", "");
    }
  }, [watchClass, setValue, mode]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        setFileError("File size exceeds 50MB limit");
        return;
      }

      // Validate file type
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      const acceptedTypes = ACCEPTED_FILE_TYPES[watchType] || [];

      if (
        acceptedTypes.length > 0 &&
        !acceptedTypes.some((ext) => ext.endsWith(fileExtension || ""))
      ) {
        setFileError(
          `Invalid file type. Accepted types for ${watchType}: ${acceptedTypes.join(
            ", "
          )}`
        );
        return;
      }

      setSelectedFile(file);
      setFileError(null);
    }
  };

  // Handle form submission
  const handleFormSubmit = (formData: FormValues) => {
    // Transform form data to ContentFormData
    const transformedData: ContentFormData = {
      ...formData,
      tags: formData.tags
        ? formData.tags.split(",").map((tag) => tag.trim())
        : undefined,
    };

    // For link type, no file is required
    if (mode === "create" && watchType !== "link") {
      if (!selectedFile) {
        setFileError("File is required");
        return;
      }
      transformedData.file = selectedFile;
    }

    // In edit mode, only include file if a new one was selected
    if (mode === "edit" && selectedFile) {
      transformedData.file = selectedFile;
    }

    setFileError(null);
    onSubmit(transformedData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <Flex direction="column" gap="5">
        {/* Basic Information */}
        <Card>
          <Heading size="3" mb="4">
            Basic Information
          </Heading>

          <Flex direction="column" gap="4">
            <Box>
              <Text as="label" size="2" weight="bold" mb="1">
                Title <span style={{ color: "red" }}>*</span>
              </Text>
              <TextField.Root
                {...register("title")}
                className="w-full bg-transparent border-none outline-none"
              >
              </TextField.Root>
              {errors.title && (
                <Text size="1" color="red" mt="1">
                  {errors.title.message}
                </Text>
              )}
            </Box>

            <Grid columns="2" gap="4">
              <Box>
                <Text as="label" size="2" weight="bold" mb="1">
                  Content Type <span style={{ color: "red" }}>*</span>
                </Text>
                <Controller
                  control={control}
                  name="type"
                  render={({ field }) => (
                    <Select.Root
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <Select.Trigger />
                      <Select.Content>
                        {CONTENT_TYPES.map((type) => (
                          <Select.Item key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Root>
                  )}
                />
                {errors.type && (
                  <Text size="1" color="red" mt="1">
                    {errors.type.message}
                  </Text>
                )}
              </Box>

              <Box>
                <Text as="label" size="2" weight="bold" mb="1">
                  Access Level <span style={{ color: "red" }}>*</span>
                </Text>
                <Controller
                  control={control}
                  name="accessLevel"
                  render={({ field }) => (
                    <Select.Root
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <Select.Trigger />
                      <Select.Content>
                        {ACCESS_LEVELS.map((level) => (
                          <Select.Item key={level} value={level}>
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Root>
                  )}
                />
                {errors.accessLevel && (
                  <Text size="1" color="red" mt="1">
                    {errors.accessLevel.message}
                  </Text>
                )}
              </Box>
            </Grid>

            <Grid columns="2" gap="4">
              <Box>
                <Text as="label" size="2" weight="bold" mb="1">
                  Class <span style={{ color: "red" }}>*</span>
                </Text>
                <Controller
                  control={control}
                  name="class"
                  render={({ field }) => (
                    <Select.Root
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <Select.Trigger placeholder="Select class" />
                      <Select.Content>
                        <Select.Group>
                          <Select.Label>Your Classes</Select.Label>
                          {classes.map((cls) => (
                            <Select.Item key={cls._id} value={cls._id}>
                              {cls.name}
                            </Select.Item>
                          ))}
                        </Select.Group>
                      </Select.Content>
                    </Select.Root>
                  )}
                />
                {errors.class && (
                  <Text size="1" color="red" mt="1">
                    {errors.class.message}
                  </Text>
                )}
              </Box>

              <Box>
                <Text as="label" size="2" weight="bold" mb="1">
                  Subject <span style={{ color: "red" }}>*</span>
                </Text>
                <Controller
                  control={control}
                  name="subject"
                  render={({ field }) => (
                    <Select.Root
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={!watchClass || availableSubjects.length === 0}
                    >
                      <Select.Trigger
                        placeholder={
                          !watchClass
                            ? "Select a class first"
                            : availableSubjects.length === 0
                            ? "No subjects available"
                            : "Select a subject"
                        }
                      />
                      <Select.Content>
                        <Select.Group>
                          <Select.Label>Available Subjects</Select.Label>
                          {availableSubjects.map((subject) => (
                            <Select.Item key={subject._id} value={subject._id}>
                              {subject.name}{" "}
                              {subject.code ? `(${subject.code})` : ""}
                            </Select.Item>
                          ))}
                        </Select.Group>
                      </Select.Content>
                    </Select.Root>
                  )}
                />
                {errors.subject && (
                  <Text size="1" color="red" mt="1">
                    {errors.subject.message}
                  </Text>
                )}
              </Box>
            </Grid>

            <Box>
              <Text as="label" size="2" weight="bold" mb="1">
                Description
              </Text>
              <TextArea
                placeholder="Enter content description"
                rows={5}
                {...register("description")}
              />
            </Box>
          </Flex>
        </Card>

        {/* Content Details */}
        <Card>
          <Heading size="3" mb="4">
            Content Details
          </Heading>

          <Flex direction="column" gap="4">
            <Box>
              <Text as="label" size="2" weight="bold" mb="1">
                File Upload{" "}
                {watchType !== "link" && mode === "create" && (
                  <span style={{ color: "red" }}>*</span>
                )}
              </Text>
              <input
                type="file"
                onChange={handleFileChange}
                disabled={watchType === "link"}
                accept={ACCEPTED_FILE_TYPES[watchType]?.join(",")}
                style={{ width: "100%" }}
              />
              {fileError && (
                <Text size="1" color="red" mt="1">
                  {fileError}
                </Text>
              )}
              {watchType === "link" && (
                <Callout.Root color="blue" size="1" mt="1">
                  <Callout.Icon>
                    <InfoCircledIcon />
                  </Callout.Icon>
                  <Callout.Text>
                    For link type content, you can enter the URL in the
                    description field.
                  </Callout.Text>
                </Callout.Root>
              )}
              {mode === "edit" && initialData?.fileUrl && (
                <Callout.Root color="blue" size="1" mt="1">
                  <Callout.Icon>
                    <InfoCircledIcon />
                  </Callout.Icon>
                  <Callout.Text>
                    {selectedFile
                      ? "New file will replace the existing file."
                      : "Leave empty to keep the existing file."}
                  </Callout.Text>
                </Callout.Root>
              )}
            </Box>

            <Box>
              <Text as="label" size="2" weight="bold" mb="1">
                Tags (comma separated)
              </Text>
              <TextField.Root
                {...register("tags")}
                className="w-full bg-transparent border-none outline-none"
              >
                <TextField.Slot>
                  <Text size="2">{watch("tags")}</Text>
                </TextField.Slot>
              </TextField.Root>
            </Box>

            <Box>
              <Flex align="center" gap="2">
                <Controller
                  control={control}
                  name="isPublic"
                  render={({ field: { onChange, value, ref } }) => (
                    <Checkbox
                      ref={ref}
                      checked={value}
                      onCheckedChange={onChange}
                      disabled={watchAccessLevel === "public"}
                    />
                  )}
                />
                <Text size="2">Make this content public for everyone</Text>
              </Flex>
              {watchAccessLevel === "public" && (
                <Text size="1" color="blue" mt="1">
                  Public access level automatically makes content public
                </Text>
              )}
            </Box>
          </Flex>
        </Card>

        {/* Submit button */}
        <Flex justify="end" mt="4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Saving..."
              : mode === "create"
              ? "Create Content"
              : "Update Content"}
          </Button>
        </Flex>
      </Flex>
    </form>
  );
};
