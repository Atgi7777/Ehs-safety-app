import { Stack } from 'expo-router';

export default function Issue() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ReportIssueScreen" />
      <Stack.Screen name="IssueDetailScreen" />
      <Stack.Screen name="IssueChat" />
      
      
    </Stack>
  );
}
