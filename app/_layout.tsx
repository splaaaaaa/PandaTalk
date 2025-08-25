import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="splash" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="practice" />
      <Stack.Screen name="result" />
      <Stack.Screen name="voice-record" />
      <Stack.Screen name="voice-record-complete" />
      <Stack.Screen name="pk-arena" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="debug-api" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
