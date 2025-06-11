import { Box, Card, Heading, Text } from "@radix-ui/themes";

export const createPlaceholder = (name: string) => () =>
  (
    <Box p="4">
      <Card size="3">
        <Box p="4">
          <Heading size="5" mb="2">
            {name}
          </Heading>
          <Text color="gray">This page is under construction.</Text>
        </Box>
      </Card>
    </Box>
  );
