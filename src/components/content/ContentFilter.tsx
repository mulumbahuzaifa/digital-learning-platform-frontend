import { useState, useEffect } from "react";
import {
  Flex,
  Box,
  TextField,
  Select,
  Text,
  Button,
  Separator,
  Switch
} from "@radix-ui/themes";
import { MagnifyingGlassIcon, Cross1Icon, MixerHorizontalIcon } from "@radix-ui/react-icons";
import { useQuery } from "@tanstack/react-query";
import { classService } from "../../services/classService";
import { subjectService } from "../../services/subjectService";
import { ContentFilterParams, ContentType, AccessLevel, Class } from "../../types";

// Content types from backend
const CONTENT_TYPES: ContentType[] = [
  'note',
  'assignment',
  'slide',
  'video',
  'audio',
  'document',
  'link',
  'quiz'
];

// Access levels from backend
const ACCESS_LEVELS: AccessLevel[] = [
  'class',
  'school',
  'public'
];

interface ContentFilterProps {
  onFilter: (filters: ContentFilterParams) => void;
  initialFilters?: ContentFilterParams;
  classes?: Class[];
}

export const ContentFilter = ({ onFilter, initialFilters, classes }: ContentFilterProps) => {
  const [search, setSearch] = useState(initialFilters?.search || "");
  const [selectedClass, setSelectedClass] = useState(initialFilters?.class || "all");
  const [selectedSubject, setSelectedSubject] = useState(initialFilters?.subject || "all");
  const [selectedType, setSelectedType] = useState<ContentType | "all">(initialFilters?.type || "all");
  const [isPublic, setIsPublic] = useState<boolean | undefined>(initialFilters?.isPublic);
  const [accessLevel, setAccessLevel] = useState<AccessLevel | "all">(initialFilters?.accessLevel || "all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Fetch classes if not provided via props
  const { data: fetchedClasses } = useQuery({
    queryKey: ["classes"],
    queryFn: () => classService.getAllClasses(),
    enabled: !classes, // Only fetch if classes not provided via props
  });

  // Use provided classes or fetched classes
  const availableClasses = classes || fetchedClasses;

  // Fetch subjects
  const { data: subjects } = useQuery({
    queryKey: ["subjects"],
    queryFn: () => subjectService.getAllSubjects(),
  });

  // Apply filters
  const applyFilters = () => {
    const filters: ContentFilterParams = {};
    
    if (search) filters.search = search;
    if (selectedClass && selectedClass !== "all") filters.class = selectedClass;
    if (selectedSubject && selectedSubject !== "all") filters.subject = selectedSubject;
    if (selectedType && selectedType !== "all") filters.type = selectedType;
    if (isPublic !== undefined) filters.isPublic = isPublic;
    if (accessLevel && accessLevel !== "all") filters.accessLevel = accessLevel;
    
    onFilter(filters);
  };

  // Reset all filters
  const resetFilters = () => {
    setSearch("");
    setSelectedClass("all");
    setSelectedSubject("all");
    setSelectedType("all");
    setIsPublic(undefined);
    setAccessLevel("all");
    
    onFilter({});
  };

  // Auto-apply filters when any filter changes
  useEffect(() => {
    applyFilters();
  }, [selectedClass, selectedSubject, selectedType, isPublic, accessLevel]);

  return (
    <Box style={{ 
      background: "var(--color-background)", 
      borderRadius: "12px", 
      padding: "16px", 
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
    }}>
      <Flex direction="column" gap="3">
        <Flex gap="3" align="end">
          <Box style={{ flex: 1 }}>
            <TextField.Root 
              size="2"
              placeholder="Search content..."
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter") {
                  applyFilters();
                }
              }}
              style={{ 
                borderRadius: "8px", 
                border: "1px solid var(--gray-5)", 
                overflow: "hidden"
              }}
            >
              <TextField.Slot>
                <MagnifyingGlassIcon height={16} width={16} />
              </TextField.Slot>
              {search && (
                <TextField.Slot>
                  <Button
                    size="1"
                    variant="ghost"
                    onClick={() => {
                      setSearch("");
                      applyFilters();
                    }}
                  >
                    <Cross1Icon height={14} width={14} />
                  </Button>
                </TextField.Slot>
              )}
            </TextField.Root>
          </Box>
          <Button 
            size="2" 
            onClick={applyFilters}
            style={{ 
              backgroundColor: "var(--green-9)", 
              borderRadius: "8px" 
            }}
          >
            Search
          </Button>
          <Button 
            size="2" 
            variant="soft" 
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            style={{ 
              borderRadius: "8px", 
              backgroundColor: showAdvancedFilters ? "var(--orange-3)" : "var(--gray-3)",
              color: showAdvancedFilters ? "var(--orange-9)" : "var(--gray-9)",
            }}
          >
            <MixerHorizontalIcon height={16} width={16} />
            <span style={{ marginLeft: "4px" }}>Filters</span>
          </Button>
        </Flex>

        {showAdvancedFilters && (
          <>
            <Separator size="4" style={{ margin: "8px 0" }} />

            <Flex wrap="wrap" gap="3">
              <Box style={{ minWidth: "180px" }}>
                <Text as="label" size="2" weight="bold" style={{ color: "var(--green-9)" }}>
                  Class
                </Text>
                <Select.Root
                  size="2"
                  value={selectedClass}
                  onValueChange={setSelectedClass}
                >
                  <Select.Trigger placeholder="All Classes" style={{ borderRadius: "8px" }} />
                  <Select.Content>
                    <Select.Group>
                      <Select.Item value="all">All Classes</Select.Item>
                      {availableClasses?.map((cls) => (
                        <Select.Item key={cls._id} value={cls._id}>
                          {cls.name}
                        </Select.Item>
                      ))}
                    </Select.Group>
                  </Select.Content>
                </Select.Root>
              </Box>

              <Box style={{ minWidth: "180px" }}>
                <Text as="label" size="2" weight="bold" style={{ color: "var(--orange-9)" }}>
                  Subject
                </Text>
                <Select.Root
                  size="2"
                  value={selectedSubject}
                  onValueChange={setSelectedSubject}
                >
                  <Select.Trigger placeholder="All Subjects" style={{ borderRadius: "8px" }} />
                  <Select.Content>
                    <Select.Group>
                      <Select.Item value="all">All Subjects</Select.Item>
                      {subjects?.map((subject) => (
                        <Select.Item key={subject._id} value={subject._id}>
                          {subject.name}
                        </Select.Item>
                      ))}
                    </Select.Group>
                  </Select.Content>
                </Select.Root>
              </Box>

              <Box style={{ minWidth: "180px" }}>
                <Text as="label" size="2" weight="bold" style={{ color: "var(--blue-9)" }}>
                  Content Type
                </Text>
                <Select.Root
                  size="2"
                  value={selectedType}
                  onValueChange={(value) => setSelectedType(value as ContentType | "all")}
                >
                  <Select.Trigger placeholder="All Types" style={{ borderRadius: "8px" }} />
                  <Select.Content>
                    <Select.Group>
                      <Select.Item value="all">All Types</Select.Item>
                      {CONTENT_TYPES.map((type) => (
                        <Select.Item key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </Select.Item>
                      ))}
                    </Select.Group>
                  </Select.Content>
                </Select.Root>
              </Box>

              <Box style={{ minWidth: "180px" }}>
                <Text as="label" size="2" weight="bold" style={{ color: "var(--purple-9)" }}>
                  Access Level
                </Text>
                <Select.Root
                  size="2"
                  value={accessLevel}
                  onValueChange={(value) => setAccessLevel(value as AccessLevel | "all")}
                >
                  <Select.Trigger placeholder="All Access Levels" style={{ borderRadius: "8px" }} />
                  <Select.Content>
                    <Select.Group>
                      <Select.Item value="all">All Access Levels</Select.Item>
                      {ACCESS_LEVELS.map((level) => (
                        <Select.Item key={level} value={level}>
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </Select.Item>
                      ))}
                    </Select.Group>
                  </Select.Content>
                </Select.Root>
              </Box>

              <Box style={{ minWidth: "180px" }}>
                <Text as="label" size="2" weight="bold" style={{ color: "var(--red-9)" }}>
                  Visibility
                </Text>
                <Flex gap="3" align="center" mt="1">
                  <Text size="2" as="label">
                    Public
                  </Text>
                  <Switch
                    checked={isPublic === true}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setIsPublic(true);
                      } else if (isPublic === true) {
                        setIsPublic(undefined);
                      } else {
                        setIsPublic(false);
                      }
                    }}
                    style={{ 
                      '--switch-thumb-color': 'var(--green-9)',
                      '--switch-active-color': 'var(--green-5)',
                    } as React.CSSProperties}
                  />
                </Flex>
              </Box>
            </Flex>

            <Flex justify="end" mt="2">
              <Button 
                size="2" 
                variant="soft" 
                onClick={resetFilters}
                style={{ 
                  backgroundColor: "var(--orange-3)", 
                  color: "var(--orange-9)", 
                  borderRadius: "8px" 
                }}
              >
                Reset Filters
              </Button>
            </Flex>
          </>
        )}
      </Flex>
    </Box>
  );
}; 