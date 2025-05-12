import { Stack } from 'expo-router';

export default function InstructionLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ReportIssueScreen" />
      <Stack.Screen name="IssueDetailScreen" />
      
    </Stack>
  );
}
