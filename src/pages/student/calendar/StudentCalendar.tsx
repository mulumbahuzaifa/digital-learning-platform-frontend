import { useQuery } from "@tanstack/react-query";
import {
  Card,
  Grid,
  Flex,
  Text,
  Heading,
  Box,
  Button,
  Badge,
  Separator,
  Table,
} from "@radix-ui/themes";
import { calendarService } from "../../../services/calendarService";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import {
  CalendarIcon,
  ClockIcon,
  PersonIcon,
  CheckCircledIcon,
  CrossCircledIcon,
} from "@radix-ui/react-icons";
import { CalendarEvent } from "../../../types";
import { formatDate } from "../../../utils/formatters";
import { useCalendarMutation } from "../../../hooks/useCalendarMutation";

const StudentCalendar = () => {
  // Fetch calendar events
  const { data: events, isLoading: isLoadingEvents } = useQuery<
    CalendarEvent[]
  >({
    queryKey: ["calendarEvents"],
    queryFn: () => calendarService.getEvents(),
  });

  const { updateAttendance } = useCalendarMutation();

  if (isLoadingEvents) {
    return <LoadingSpinner />;
  }

  const handleAttendanceUpdate = (eventId: string, status: string) => {
    updateAttendance.mutate({ id: eventId, data: { status } });
  };

  return (
    <Box p="4">
      <Flex direction="column" gap="6">
        {/* Header */}
        <Card size="3">
          <Flex direction="column" gap="4">
            <Flex justify="between" align="center">
              <Box>
                <Heading size="5">My Calendar</Heading>
                <Text color="gray" size="2">
                  View and manage your schedule
                </Text>
              </Box>
            </Flex>
            <Separator size="4" />
            <Grid columns={{ initial: "1", sm: "2", md: "3" }} gap="4">
              <Card size="2">
                <Flex direction="column" gap="2">
                  <Flex gap="2" align="center">
                    <CalendarIcon
                      width={20}
                      height={20}
                      color="var(--blue-9)"
                    />
                    <Text size="2" weight="bold">
                      Total Events
                    </Text>
                  </Flex>
                  <Text size="6" weight="bold" color="blue">
                    {events?.length || 0}
                  </Text>
                </Flex>
              </Card>

              <Card size="2">
                <Flex direction="column" gap="2">
                  <Flex gap="2" align="center">
                    <CheckCircledIcon
                      width={20}
                      height={20}
                      color="var(--green-9)"
                    />
                    <Text size="2" weight="bold">
                      Attended
                    </Text>
                  </Flex>
                  <Text size="6" weight="bold" color="green">
                    {events?.filter(
                      (event) => event.attendanceStatus === "present"
                    ).length || 0}
                  </Text>
                </Flex>
              </Card>

              <Card size="2">
                <Flex direction="column" gap="2">
                  <Flex gap="2" align="center">
                    <CrossCircledIcon
                      width={20}
                      height={20}
                      color="var(--red-9)"
                    />
                    <Text size="2" weight="bold">
                      Missed
                    </Text>
                  </Flex>
                  <Text size="6" weight="bold" color="red">
                    {events?.filter(
                      (event) => event.attendanceStatus === "absent"
                    ).length || 0}
                  </Text>
                </Flex>
              </Card>
            </Grid>
          </Flex>
        </Card>

        {/* Upcoming Events */}
        <Card size="3">
          <Flex direction="column" gap="4">
            <Heading size="4">Upcoming Events</Heading>
            <Separator size="4" />
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>Event</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Date</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Time</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Location</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {events?.map((event) => (
                  <Table.Row key={event._id}>
                    <Table.Cell>
                      <Flex direction="column" gap="1">
                        <Text weight="bold">{event.title}</Text>
                        <Text size="1" color="gray">
                          {event.description}
                        </Text>
                      </Flex>
                    </Table.Cell>
                    <Table.Cell>{formatDate(event.startDate)}</Table.Cell>
                    <Table.Cell>
                      <Flex gap="1" align="center">
                        <ClockIcon width={14} height={14} />
                        <Text>
                          {new Date(event.startDate).toLocaleTimeString()} -{" "}
                          {new Date(event.endDate).toLocaleTimeString()}
                        </Text>
                      </Flex>
                    </Table.Cell>
                    <Table.Cell>
                      <Flex gap="1" align="center">
                        <PersonIcon width={14} height={14} />
                        <Text>{event.location}</Text>
                      </Flex>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge
                        color={
                          event.attendanceStatus === "present"
                            ? "green"
                            : event.attendanceStatus === "absent"
                            ? "red"
                            : "blue"
                        }
                      >
                        {event.attendanceStatus || "Not marked"}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Flex gap="2">
                        {!event.attendanceStatus && (
                          <>
                            <Button
                              size="1"
                              color="green"
                              onClick={() =>
                                handleAttendanceUpdate(event._id, "present")
                              }
                            >
                              Present
                            </Button>
                            <Button
                              size="1"
                              color="red"
                              onClick={() =>
                                handleAttendanceUpdate(event._id, "absent")
                              }
                            >
                              Absent
                            </Button>
                          </>
                        )}
                      </Flex>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Flex>
        </Card>
      </Flex>
    </Box>
  );
};

export default StudentCalendar;
