import BottomSheet from "@gorhom/bottom-sheet";
import { Tabs } from "expo-router";
import React, { useRef } from "react";
import { View } from "react-native";
import { CustomTabBar } from "../../components/layout/CustomTabBar";
import ActiveWorkoutSheet from "../../components/ui/ActiveWorkoutSheet";
import { MiniWorkoutPlayer } from "../../components/ui/MiniWorkoutPlayer";
import { useActiveWorkout } from "../../contexts/ActiveWorkoutContext";

function TabsLayoutContent() {
  const { activeWorkout, setIsExpanded, isExpanded } = useActiveWorkout();
  const activeWorkoutSheetRef = useRef<BottomSheet>(null);

  const handleExpandWorkout = () => {
    setIsExpanded(true);
  };

  const handleWorkoutSettings = () => {
    console.log("Open settings");
    // TODO: Show workout settings
  };

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        tabBar={(props) => (
          <View>
            {activeWorkout && !isExpanded && (
              <MiniWorkoutPlayer onExpand={handleExpandWorkout} />
            )}
            <CustomTabBar {...props} />
          </View>
        )}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="schedule"
          options={{
            title: "Schedule",
          }}
        />
        <Tabs.Screen
          name="workout"
          options={{
            title: "Workout",
          }}
        />
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
          }}
        />
      </Tabs>

      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999,
          pointerEvents: "box-none",
        }}
      >
        <ActiveWorkoutSheet
          ref={activeWorkoutSheetRef}
          isExpanded={activeWorkout ? isExpanded : false}
        />
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return <TabsLayoutContent />;
}
