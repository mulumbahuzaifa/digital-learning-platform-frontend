import React, { useState } from 'react';
import { 
  Card, 
  Flex, 
  Box, 
  Text, 
  Heading, 
  Button,
  Switch,
  Select,
  Grid,
  Tabs,
  TextField
} from '@radix-ui/themes';
import { 
  BellIcon, 
  LockClosedIcon, 
  GlobeIcon,
  GearIcon,
  EnvelopeClosedIcon,
  UploadIcon,
  CalendarIcon
} from '@radix-ui/react-icons';

interface Settings {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    digest: string;
    assignmentAlerts: boolean;
    attendanceAlerts: boolean;
  };
  security: {
    twoFactor: boolean;
    sessionTimeout: string;
    passwordExpiry: string;
  };
  teaching: {
    defaultClassView: string;
    gradingSystem: string;
    attendanceTracking: string;
    calendarSync: boolean;
  };
  platform: {
    language: string;
    timezone: string;
    dateFormat: string;
    theme: string;
  };
}

const TeacherSettings = () => {
  const [settings, setSettings] = useState<Settings>({
    notifications: {
      email: true,
      push: true,
      sms: false,
      digest: 'daily',
      assignmentAlerts: true,
      attendanceAlerts: true
    },
    security: {
      twoFactor: false,
      sessionTimeout: '30',
      passwordExpiry: '90'
    },
    teaching: {
      defaultClassView: 'list',
      gradingSystem: 'percentage',
      attendanceTracking: 'manual',
      calendarSync: true
    },
    platform: {
      language: 'en',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
      theme: 'light'
    }
  });

  const handleSettingChange = (category: keyof Settings, setting: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      <Flex justify="between" align="center">
        <Heading size="6">Teacher Settings</Heading>
        <Button>Save Changes</Button>
      </Flex>

      <Tabs.Root defaultValue="notifications">
        <Tabs.List>
          <Tabs.Trigger value="notifications">
            <BellIcon />
            <Text>Notifications</Text>
          </Tabs.Trigger>
          <Tabs.Trigger value="teaching">
            <UploadIcon />
            <Text>Teaching</Text>
          </Tabs.Trigger>
          <Tabs.Trigger value="security">
            <LockClosedIcon />
            <Text>Security</Text>
          </Tabs.Trigger>
          <Tabs.Trigger value="platform">
            <GearIcon />
            <Text>Platform</Text>
          </Tabs.Trigger>
        </Tabs.List>

        <Box pt="4">
          <Tabs.Content value="notifications">
            <Card>
              <Flex direction="column" gap="4" p="4">
                <Heading size="4">Notification Preferences</Heading>
                
                <Flex justify="between" align="center">
                  <Flex gap="2" align="center">
                    <EnvelopeClosedIcon />
                    <Text>Email Notifications</Text>
                  </Flex>
                  <Switch 
                    checked={settings.notifications.email}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'email', checked)}
                  />
                </Flex>

                <Flex justify="between" align="center">
                  <Flex gap="2" align="center">
                    <BellIcon />
                    <Text>Push Notifications</Text>
                  </Flex>
                  <Switch 
                    checked={settings.notifications.push}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'push', checked)}
                  />
                </Flex>

                <Flex justify="between" align="center">
                  <Flex gap="2" align="center">
                    <EnvelopeClosedIcon />
                    <Text>SMS Notifications</Text>
                  </Flex>
                  <Switch 
                    checked={settings.notifications.sms}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'sms', checked)}
                  />
                </Flex>

                <Flex justify="between" align="center">
                  <Flex gap="2" align="center">
                    <UploadIcon />
                    <Text>Assignment Alerts</Text>
                  </Flex>
                  <Switch 
                    checked={settings.notifications.assignmentAlerts}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'assignmentAlerts', checked)}
                  />
                </Flex>

                <Flex justify="between" align="center">
                  <Flex gap="2" align="center">
                    <CalendarIcon />
                    <Text>Attendance Alerts</Text>
                  </Flex>
                  <Switch 
                    checked={settings.notifications.attendanceAlerts}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'attendanceAlerts', checked)}
                  />
                </Flex>

                <Flex direction="column" gap="2">
                  <Text>Digest Frequency</Text>
                  <Select.Root 
                    value={settings.notifications.digest}
                    onValueChange={(value) => handleSettingChange('notifications', 'digest', value)}
                  >
                    <Select.Trigger />
                    <Select.Content>
                      <Select.Item value="realtime">Real-time</Select.Item>
                      <Select.Item value="daily">Daily</Select.Item>
                      <Select.Item value="weekly">Weekly</Select.Item>
                    </Select.Content>
                  </Select.Root>
                </Flex>
              </Flex>
            </Card>
          </Tabs.Content>

          <Tabs.Content value="teaching">
            <Card>
              <Flex direction="column" gap="4" p="4">
                <Heading size="4">Teaching Preferences</Heading>

                <Flex direction="column" gap="2">
                  <Text>Default Class View</Text>
                  <Select.Root 
                    value={settings.teaching.defaultClassView}
                    onValueChange={(value) => handleSettingChange('teaching', 'defaultClassView', value)}
                  >
                    <Select.Trigger />
                    <Select.Content>
                      <Select.Item value="list">List View</Select.Item>
                      <Select.Item value="grid">Grid View</Select.Item>
                      <Select.Item value="calendar">Calendar View</Select.Item>
                    </Select.Content>
                  </Select.Root>
                </Flex>

                <Flex direction="column" gap="2">
                  <Text>Grading System</Text>
                  <Select.Root 
                    value={settings.teaching.gradingSystem}
                    onValueChange={(value) => handleSettingChange('teaching', 'gradingSystem', value)}
                  >
                    <Select.Trigger />
                    <Select.Content>
                      <Select.Item value="percentage">Percentage</Select.Item>
                      <Select.Item value="letter">Letter Grades</Select.Item>
                      <Select.Item value="points">Points</Select.Item>
                    </Select.Content>
                  </Select.Root>
                </Flex>

                <Flex direction="column" gap="2">
                  <Text>Attendance Tracking</Text>
                  <Select.Root 
                    value={settings.teaching.attendanceTracking}
                    onValueChange={(value) => handleSettingChange('teaching', 'attendanceTracking', value)}
                  >
                    <Select.Trigger />
                    <Select.Content>
                      <Select.Item value="manual">Manual</Select.Item>
                      <Select.Item value="automatic">Automatic</Select.Item>
                      <Select.Item value="hybrid">Hybrid</Select.Item>
                    </Select.Content>
                  </Select.Root>
                </Flex>

                <Flex justify="between" align="center">
                  <Flex gap="2" align="center">
                    <CalendarIcon />
                    <Text>Calendar Sync</Text>
                  </Flex>
                  <Switch 
                    checked={settings.teaching.calendarSync}
                    onCheckedChange={(checked) => handleSettingChange('teaching', 'calendarSync', checked)}
                  />
                </Flex>
              </Flex>
            </Card>
          </Tabs.Content>

          <Tabs.Content value="security">
            <Card>
              <Flex direction="column" gap="4" p="4">
                <Heading size="4">Security Settings</Heading>

                <Flex justify="between" align="center">
                  <Flex gap="2" align="center">
                    <LockClosedIcon />
                    <Text>Two-Factor Authentication</Text>
                  </Flex>
                  <Switch 
                    checked={settings.security.twoFactor}
                    onCheckedChange={(checked) => handleSettingChange('security', 'twoFactor', checked)}
                  />
                </Flex>

                <Flex direction="column" gap="2">
                  <Text>Session Timeout (minutes)</Text>
                  <TextField.Root>
                    <input
                      type="number"
                      value={settings.security.sessionTimeout}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        handleSettingChange('security', 'sessionTimeout', e.target.value)
                      }
                      className="w-full bg-transparent border-none outline-none"
                    />
                  </TextField.Root>
                </Flex>

                <Flex direction="column" gap="2">
                  <Text>Password Expiry (days)</Text>
                  <TextField.Root>
                    <input
                      type="number"
                      value={settings.security.passwordExpiry}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        handleSettingChange('security', 'passwordExpiry', e.target.value)
                      }
                      className="w-full bg-transparent border-none outline-none"
                    />
                  </TextField.Root>
                </Flex>
              </Flex>
            </Card>
          </Tabs.Content>

          <Tabs.Content value="platform">
            <Card>
              <Flex direction="column" gap="4" p="4">
                <Heading size="4">Platform Settings</Heading>

                <Flex direction="column" gap="2">
                  <Text>Language</Text>
                  <Select.Root 
                    value={settings.platform.language}
                    onValueChange={(value) => handleSettingChange('platform', 'language', value)}
                  >
                    <Select.Trigger />
                    <Select.Content>
                      <Select.Item value="en">English</Select.Item>
                      <Select.Item value="es">Spanish</Select.Item>
                      <Select.Item value="fr">French</Select.Item>
                    </Select.Content>
                  </Select.Root>
                </Flex>

                <Flex direction="column" gap="2">
                  <Text>Timezone</Text>
                  <Select.Root 
                    value={settings.platform.timezone}
                    onValueChange={(value) => handleSettingChange('platform', 'timezone', value)}
                  >
                    <Select.Trigger />
                    <Select.Content>
                      <Select.Item value="UTC">UTC</Select.Item>
                      <Select.Item value="EST">EST</Select.Item>
                      <Select.Item value="PST">PST</Select.Item>
                    </Select.Content>
                  </Select.Root>
                </Flex>

                <Flex direction="column" gap="2">
                  <Text>Date Format</Text>
                  <Select.Root 
                    value={settings.platform.dateFormat}
                    onValueChange={(value) => handleSettingChange('platform', 'dateFormat', value)}
                  >
                    <Select.Trigger />
                    <Select.Content>
                      <Select.Item value="MM/DD/YYYY">MM/DD/YYYY</Select.Item>
                      <Select.Item value="DD/MM/YYYY">DD/MM/YYYY</Select.Item>
                      <Select.Item value="YYYY-MM-DD">YYYY-MM-DD</Select.Item>
                    </Select.Content>
                  </Select.Root>
                </Flex>

                <Flex direction="column" gap="2">
                  <Text>Theme</Text>
                  <Select.Root 
                    value={settings.platform.theme}
                    onValueChange={(value) => handleSettingChange('platform', 'theme', value)}
                  >
                    <Select.Trigger />
                    <Select.Content>
                      <Select.Item value="light">Light</Select.Item>
                      <Select.Item value="dark">Dark</Select.Item>
                      <Select.Item value="system">System</Select.Item>
                    </Select.Content>
                  </Select.Root>
                </Flex>
              </Flex>
            </Card>
          </Tabs.Content>
        </Box>
      </Tabs.Root>
    </div>
  );
};

export default TeacherSettings; 