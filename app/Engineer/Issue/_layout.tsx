import { Stack } from 'expo-router';

export default function IssueLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ChatScreen" />
      <Stack.Screen name="IssueDetailScreen" />

      
    </Stack>
  );
}
