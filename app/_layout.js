import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="recipe/[id]"
          options={{
            title: 'Recipe',
            headerStyle: { backgroundColor: '#e67e22' },
            headerTintColor: '#fff',
          }}
        />
        <Stack.Screen
          name="recipe/ai"
          options={{
            title: 'AI Recipe',
            headerStyle: { backgroundColor: '#e67e22' },
            headerTintColor: '#fff',
          }}
        />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
