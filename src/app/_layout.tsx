import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { ActiveWorkoutProvider } from "../contexts/ActiveWorkoutContext";
import { CreateRoutineProvider } from "../contexts/CreateRoutineContext";
import { ThemeProvider } from "../contexts/ThemeContext";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <ActiveWorkoutProvider>
          <CreateRoutineProvider>
            <SafeAreaProvider>
              <SafeAreaView style={{ flex: 1, backgroundColor: "#0B0D0E" }}>
                <Stack
                  screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: "#0B0D0E" },
                  }}
                >
                  <Stack.Screen name="index" />
                  <Stack.Screen name="OnBoarding" />
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen name="exercise-picker/index" />
                  <Stack.Screen name="create-routine/index" />
                  <Stack.Screen name="settings/index" />
                  <Stack.Screen name="user/follows/[id]" />
                </Stack>
              </SafeAreaView>
            </SafeAreaProvider>
          </CreateRoutineProvider>
        </ActiveWorkoutProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
