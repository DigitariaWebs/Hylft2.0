import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { auth } from "../utils/auth";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface OnboardingPage {
  id: number;
  image: any;
  title: string;
  subtitle: string;
  buttonText: string;
}

const ONBOARDING_DATA: OnboardingPage[] = [
  {
    id: 1,
    image: require("../../assets/images/OnBoarding/ManLookingUp.jpg"),
    title: "Your Fitness, Your",
    subtitle: '"Built for your body and goals."',
    buttonText: "Get Started",
  },
  {
    id: 2,
    image: require("../../assets/images/OnBoarding/ManWithOneWeights.jpg"),
    title: "Welcome To",
    subtitle: '"Your personal fitness journey starts here."',
    buttonText: "Next",
  },
  {
    id: 3,
    image: require("../../assets/images/OnBoarding/ManWithTwoWeights.jpg"),
    title: "Start Your Fitness",
    subtitle: '"Personalized workouts just for you"',
    buttonText: "Next",
  },
];

export default function OnBoarding() {
  const [currentPage, setCurrentPage] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / SCREEN_WIDTH);
    setCurrentPage(page);
  };

  const handleNext = () => {
    if (currentPage < ONBOARDING_DATA.length - 1) {
      scrollViewRef.current?.scrollTo({
        x: SCREEN_WIDTH * (currentPage + 1),
        animated: true,
      });
    } else {
      handleFinish();
    }
  };

  const handleSkip = () => {
    handleFinish();
  };

  const handleFinish = async () => {
    // Mark onboarding as completed
    await auth.setOnboardingCompleted();

    // Check if user is logged in
    const isLoggedIn = await auth.isLoggedIn();

    // Navigate to auth landing if not logged in, otherwise go to schedule
    if (isLoggedIn) {
      router.navigate("/(tabs)/schedule");
    } else {
      router.navigate("/auth");
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require("../../assets/images/Logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* ScrollView for pages */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {ONBOARDING_DATA.map((page) => (
          <View key={page.id} style={styles.page}>
            <View style={styles.imageContainer}>
              <Image
                source={page.image}
                style={styles.image}
                resizeMode="cover"
              />
              <View style={styles.imageOverlay} />
              <View style={styles.contentContainer}>
                <View style={styles.titleContainer}>
                  <Text style={styles.title}>{page.title}</Text>
                  {page.id === 1 && <Text style={styles.titleBold}>Ways!</Text>}
                  {page.id === 2 && (
                    <Text style={styles.titleBold}>FitLife!</Text>
                  )}
                  {page.id === 3 && (
                    <Text style={styles.titleBold}>Journey</Text>
                  )}
                </View>
                <Text style={styles.subtitle}>{page.subtitle}</Text>
              </View>

              {/* Buttons positioned over image */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleNext}
                  activeOpacity={0.8}
                >
                  <Text style={styles.primaryButtonText}>
                    {ONBOARDING_DATA[currentPage].buttonText}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.skipButton}
                  onPress={handleSkip}
                  activeOpacity={0.7}
                >
                  <Text style={styles.skipButtonText}>Skip</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background.dark,
    },
    logoContainer: {
      position: "absolute",
      top: 60,
      left: 20,
      zIndex: 10,
    },
    logo: {
      width: 120,
      height: 40,
    },
    scrollView: {
      flex: 1,
    },
    page: {
      width: SCREEN_WIDTH,
      flex: 1,
    },
    imageContainer: {
      height: SCREEN_HEIGHT,
      position: "relative",
    },
    image: {
      width: "100%",
      height: "100%",
    },
    imageOverlay: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      top: 0,
      backgroundColor: theme.background.dark,
      opacity: 0.7,
    },
    contentContainer: {
      position: "absolute",
      bottom: 200,
      left: 0,
      right: 0,
      paddingHorizontal: 32,
      alignItems: "flex-start",
    },
    title: {
      fontSize: 32,
      fontWeight: "normal",
      color: theme.foreground.white,
      marginBottom: 16,
      lineHeight: 30,
      textAlign: "left",
    },
    titleContainer: {
      alignItems: "flex-start",
      marginBottom: 16,
    },
    titleBold: {
      fontSize: 54,
      fontWeight: "bold",
      color: theme.primary.main,
      lineHeight: 65,
    },
    subtitle: {
      fontSize: 15,
      color: theme.foreground.gray,
      lineHeight: 24,
      textAlign: "left",
    },
    buttonContainer: {
      position: "absolute",
      bottom: 48,
      left: 0,
      right: 0,
      paddingHorizontal: 32,
    },
    primaryButton: {
      backgroundColor: theme.primary.main,
      paddingVertical: 18,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    primaryButtonText: {
      color: theme.background.dark,
      fontSize: 18,
      fontWeight: "bold",
    },
    skipButton: {
      paddingVertical: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    skipButtonText: {
      color: theme.foreground.gray,
      fontSize: 16,
      fontWeight: "600",
    },
  });


