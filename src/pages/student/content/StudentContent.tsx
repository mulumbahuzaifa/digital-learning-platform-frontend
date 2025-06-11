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
} from "@radix-ui/themes";
import { contentService } from "../../../services/contentService";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { Link } from "react-router-dom";
import { formatDate } from "../../../utils/formatters";
import { Content } from "../../../types";

const StudentContent = () => {
  const { data: content, isLoading } = useQuery<Content[]>({
    queryKey: ["student-content"],
    queryFn: () => contentService.getMyContent({}),
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!content?.length) {
    return (
      <Box p="4">
        <Card size="3">
          <Flex
            direction="column"
            gap="4"
            align="center"
            justify="center"
            p="6"
          >
            <Heading size="5" align="center">
              No Content Available
            </Heading>
            <Text color="gray" align="center">
              There is no learning content available at the moment.
            </Text>
          </Flex>
        </Card>
      </Box>
    );
  }

  return (
    <Box p="4">
      <Flex direction="column" gap="6">
        <Heading size="5">Learning Content</Heading>

        <Grid columns={{ initial: "1", sm: "2", md: "3" }} gap="4">
          {content.map((item) => (
            <Card key={item._id} size="2">
              <Flex direction="column" gap="3">
                <Box>
                  <Text weight="bold">{item.title}</Text>
                  <Flex gap="2" align="center" mt="1">
                    <Badge color="blue" variant="soft">
                      {item.type}
                    </Badge>
                    <Text size="1" color="gray">
                      {formatDate(item.createdAt.toString())}
                    </Text>
                  </Flex>
                </Box>
                <Text size="1" color="gray" truncate>
                  {item.description}
                </Text>
                <Button asChild size="2">
                  <Link to={`/student/content/${item._id}`}>View Content</Link>
                </Button>
              </Flex>
            </Card>
          ))}
        </Grid>
      </Flex>
    </Box>
  );
};

export default StudentContent;
