import { useRouter } from "expo-router";
import { useState } from "react";
import SplashScreen from "../components/ui/SplashScreen";
import { auth } from "../utils/auth";

export default function Index() {
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashComplete = async () => {
    // Hide splash screen
    setShowSplash(false);

    try {
      // Check if user has completed onboarding
      const hasSeenOnboarding = await auth.hasCompletedOnboarding();

      // Check if user is logged in
      const isLoggedIn = await auth.isLoggedIn();

      // Navigation logic:
      // 1. If not seen onboarding -> go to onboarding
      // 2. If seen onboarding but not logged in -> go to auth landing
      // 3. If logged in -> go to schedule
      if (!hasSeenOnboarding) {
        router.navigate("/OnBoarding");
      } else if (!isLoggedIn) {
        router.navigate("/auth");
      } else {
        router.navigate("/(tabs)/schedule");
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      // Default to onboarding on error
      router.navigate("/OnBoarding");
    }
  };

  if (showSplash) {
    return <SplashScreen onAnimationComplete={handleSplashComplete} />;
  }

  // This will briefly show while navigating
  return null;
}
