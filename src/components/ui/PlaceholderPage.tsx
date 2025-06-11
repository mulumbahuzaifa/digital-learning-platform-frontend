import React from 'react';
import { Card, Flex, Text, Heading, Box, Button } from '@radix-ui/themes';
import { RocketIcon } from '@radix-ui/react-icons';
import { useNavigate } from 'react-router-dom';

interface PlaceholderPageProps {
  title?: string;
  description?: string;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ 
  title = "Feature Coming Soon", 
  description = "We're working hard to bring you this feature. Please check back later!" 
}) => {
  const navigate = useNavigate();
  
  return (
    <Card size="4" className="mx-auto max-w-lg">
      <Flex direction="column" align="center" gap="5" py="6">
        <Box 
          p="4" 
          style={{ 
            background: 'var(--accent-3)', 
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center' 
          }}
        >
          <RocketIcon width="40" height="40" />
        </Box>
        
        <Heading size="5" align="center">{title}</Heading>
        
        <Text align="center" size="2" color="gray">
          {description}
        </Text>
        
        <Button onClick={() => navigate(-1)} variant="soft">
          Go Back
        </Button>
      </Flex>
    </Card>
  );
};

export default PlaceholderPage; 