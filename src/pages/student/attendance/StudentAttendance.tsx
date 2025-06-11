import { useQuery } from "@tanstack/react-query";
import {
  Card,
  Flex,
  Text,
  Heading,
  Box,
  Table,
  Select,
  Badge,
} from "@radix-ui/themes";
import { attendanceService } from "../../../services/attendanceService";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { formatDate } from "../../../utils/formatters";
import { useState } from "react";
import {
  Attendance,
  AttendanceFilterParams,
  AttendanceStatus,
} from "../../../types";

const StudentAttendance = () => {
  const [filter, setFilter] = useState<AttendanceFilterParams>({
    month: (new Date().getMonth() + 1).toString(),
    date: new Date().toISOString().split("T")[0],
  });

  // Fetch attendance records
  const { data: attendanceRecords = [], isLoading } = useQuery({
    queryKey: ["attendance", filter],
    queryFn: () => attendanceService.getAllAttendance(filter),
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case "present":
        return "green";
      case "absent":
        return "red";
      case "late":
        return "yellow";
      case "excused":
        return "blue";
      default:
        return "gray";
    }
  };

  return (
    <Box p="4">
      <Card size="3">
        <Flex direction="column" gap="4">
          <Flex justify="between" align="center">
            <Heading size="5">My Attendance</Heading>
            <Flex gap="3">
              <Select.Root
                value={filter.month}
                onValueChange={(value) =>
                  setFilter((prev) => ({ ...prev, month: value }))
                }
              >
                <Select.Trigger placeholder="Select month" />
                <Select.Content>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <Select.Item key={month} value={month.toString()}>
                      {new Date(2000, month - 1).toLocaleString("default", {
                        month: "long",
                      })}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>

              <Select.Root
                value={filter.date?.split("-")[0]}
                onValueChange={(value) => {
                  const currentDate = filter.date?.split("-") || [];
                  const newDate = `${value}-${currentDate[1]}-${currentDate[2]}`;
                  setFilter((prev) => ({ ...prev, date: newDate }));
                }}
              >
                <Select.Trigger placeholder="Select year" />
                <Select.Content>
                  {Array.from(
                    { length: 5 },
                    (_, i) => new Date().getFullYear() - 2 + i
                  ).map((year) => (
                    <Select.Item key={year} value={year.toString()}>
                      {year}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Flex>
          </Flex>

          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Date</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Subject</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Remarks</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {attendanceRecords.map((record: Attendance) => (
                <Table.Row key={record._id}>
                  <Table.Cell>{formatDate(record.date)}</Table.Cell>
                  <Table.Cell>
                    {typeof record.subject === "string"
                      ? record.subject
                      : record.subject?.name || "-"}
                  </Table.Cell>
                  <Table.Cell>
                    {record.records.map((r, index) => (
                      <Badge key={index} color={getStatusColor(r.status)}>
                        {r.status}
                      </Badge>
                    ))}
                  </Table.Cell>
                  <Table.Cell>{record.notes || "-"}</Table.Cell>
                </Table.Row>
              ))}
              {attendanceRecords.length === 0 && (
                <Table.Row>
                  <Table.Cell colSpan={4}>
                    <Text align="center" color="gray">
                      No attendance records found for the selected period
                    </Text>
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Root>
        </Flex>
      </Card>
    </Box>
  );
};

export default StudentAttendance;
