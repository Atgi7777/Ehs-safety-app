import { Stack } from 'expo-router';

export default function InstructionLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="InstructionSlideScreen" />
      <Stack.Screen name="SignatureConfirmScreen" />
       <Stack.Screen name="InstructionHistoryScreen" />
       <Stack.Screen name="InstructionDetailScreen" />
              <Stack.Screen name="EmployeeInstruction" />

      
    </Stack>
  );
}
