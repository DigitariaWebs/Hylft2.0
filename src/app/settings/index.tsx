import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Theme, ThemeType } from "../../constants/themes";
import { useTheme } from "../../contexts/ThemeContext";

// ─── Storage keys ─────────────────────────────────────────────────────────────
const KEYS = {
  weightUnit: "@hylift_weight_unit",
  distanceUnit: "@hylift_distance_unit",
  weekStart: "@hylift_week_start",
  pushNotifications: "@hylift_push_notif",
  workoutReminders: "@hylift_workout_reminder",
  emailNotifications: "@hylift_email_notif",
  privateAccount: "@hylift_private_account",
  healthConnect: "@hylift_health_connect",
};

// ─── Styles ───────────────────────────────────────────────────────────────────
function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background.dark,
    },
    // header
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.background.accent,
    },
    backBtn: {
      padding: 6,
      marginRight: 8,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: theme.foreground.white,
    },
    // section
    sectionHeader: {
      paddingHorizontal: 16,
      paddingTop: 28,
      paddingBottom: 8,
    },
    sectionLabel: {
      fontSize: 12,
      fontWeight: "600",
      letterSpacing: 0.8,
      textTransform: "uppercase",
      color: theme.foreground.gray,
    },
    sectionBody: {
      backgroundColor: theme.background.accent,
      marginHorizontal: 16,
      borderRadius: 12,
      overflow: "hidden",
    },
    // row
    row: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    rowBorder: {
      borderBottomWidth: 1,
      borderBottomColor: theme.background.darker,
    },
    rowIcon: {
      width: 34,
      height: 34,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    rowContent: {
      flex: 1,
    },
    rowTitle: {
      fontSize: 15,
      fontWeight: "500",
      color: theme.foreground.white,
    },
    rowSubtitle: {
      fontSize: 12,
      color: theme.foreground.gray,
      marginTop: 1,
    },
    rowRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    rowValue: {
      fontSize: 14,
      color: theme.foreground.gray,
    },
    // segmented control
    segmented: {
      flexDirection: "row",
      backgroundColor: theme.background.darker,
      borderRadius: 8,
      padding: 3,
      gap: 2,
    },
    segBtn: {
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 6,
    },
    segBtnActive: {
      backgroundColor: theme.primary.main,
    },
    segBtnText: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.foreground.gray,
    },
    segBtnTextActive: {
      color: theme.background.dark,
    },
    // danger
    dangerSection: {
      backgroundColor: theme.background.accent,
      marginHorizontal: 16,
      borderRadius: 12,
      overflow: "hidden",
    },
    dangerRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 15,
    },
    dangerText: {
      fontSize: 15,
      fontWeight: "600",
      marginLeft: 12,
    },
    // version
    version: {
      textAlign: "center",
      fontSize: 12,
      color: theme.foreground.gray,
      marginTop: 28,
      marginBottom: 16,
    },
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface RowProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  showBorder?: boolean;
  showChevron?: boolean;
  styles: ReturnType<typeof createStyles>;
  theme: Theme;
}

function SettingsRow({
  icon,
  iconBg,
  title,
  subtitle,
  right,
  onPress,
  showBorder = true,
  showChevron = false,
  styles,
  theme,
}: RowProps) {
  const Wrapper = onPress ? TouchableOpacity : View;
  return (
    <Wrapper
      style={[styles.row, showBorder && styles.rowBorder]}
      {...(onPress ? { onPress, activeOpacity: 0.7 } : {})}
    >
      <View style={[styles.rowIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={18} color={theme.foreground.white} />
      </View>
      <View style={styles.rowContent}>
        <Text style={styles.rowTitle}>{title}</Text>
        {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
      </View>
      {right ? (
        <View style={styles.rowRight}>{right}</View>
      ) : showChevron ? (
        <Ionicons
          name="chevron-forward"
          size={16}
          color={theme.foreground.gray}
        />
      ) : null}
    </Wrapper>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function Settings() {
  const router = useRouter();
  const { theme, themeType, setTheme } = useTheme();
  const styles = createStyles(theme);

  // ── Preferences state ────────────────────────────────────────────────────────
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");
  const [distanceUnit, setDistanceUnit] = useState<"km" | "mi">("km");
  const [weekStart, setWeekStart] = useState<"mon" | "sun">("mon");
  const [pushNotifs, setPushNotifs] = useState(true);
  const [workoutReminders, setWorkoutReminders] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(false);
  const [privateAccount, setPrivateAccount] = useState(false);
  const [healthConnect, setHealthConnect] = useState(false);

  // ── Load from storage ─────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [wu, du, ws, pn, wr, en, pa, hc] = await Promise.all([
          AsyncStorage.getItem(KEYS.weightUnit),
          AsyncStorage.getItem(KEYS.distanceUnit),
          AsyncStorage.getItem(KEYS.weekStart),
          AsyncStorage.getItem(KEYS.pushNotifications),
          AsyncStorage.getItem(KEYS.workoutReminders),
          AsyncStorage.getItem(KEYS.emailNotifications),
          AsyncStorage.getItem(KEYS.privateAccount),
          AsyncStorage.getItem(KEYS.healthConnect),
        ]);
        if (wu === "kg" || wu === "lbs") setWeightUnit(wu);
        if (du === "km" || du === "mi") setDistanceUnit(du);
        if (ws === "mon" || ws === "sun") setWeekStart(ws);
        if (pn !== null) setPushNotifs(pn === "true");
        if (wr !== null) setWorkoutReminders(wr === "true");
        if (en !== null) setEmailNotifs(en === "true");
        if (pa !== null) setPrivateAccount(pa === "true");
        if (hc !== null) setHealthConnect(hc === "true");
      } catch (_) {} // eslint-disable-line @typescript-eslint/no-unused-vars
    };
    load();
  }, []);

  // ── Persist helpers ───────────────────────────────────────────────────────────
  const save = async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (_) {} // eslint-disable-line @typescript-eslint/no-unused-vars
  };

  const togglePush = (v: boolean) => {
    setPushNotifs(v);
    save(KEYS.pushNotifications, String(v));
  };
  const toggleReminders = (v: boolean) => {
    setWorkoutReminders(v);
    save(KEYS.workoutReminders, String(v));
  };
  const toggleEmail = (v: boolean) => {
    setEmailNotifs(v);
    save(KEYS.emailNotifications, String(v));
  };
  const togglePrivate = (v: boolean) => {
    setPrivateAccount(v);
    save(KEYS.privateAccount, String(v));
  };
  const toggleHealth = (v: boolean) => {
    setHealthConnect(v);
    save(KEYS.healthConnect, String(v));
  };
  const changeWeightUnit = (v: "kg" | "lbs") => {
    setWeightUnit(v);
    save(KEYS.weightUnit, v);
  };
  const changeDistanceUnit = (v: "km" | "mi") => {
    setDistanceUnit(v);
    save(KEYS.distanceUnit, v);
  };
  const changeWeekStart = (v: "mon" | "sun") => {
    setWeekStart(v);
    save(KEYS.weekStart, v);
  };

  const handleTheme = (t: ThemeType) => {
    setTheme(t);
  };

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: () => {
          // TODO: clear auth tokens and navigate to auth screen
          router.replace("/auth" as any);
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This will permanently delete your account and all data. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // TODO: call delete account API
          },
        },
      ],
    );
  };

  // ─── Segmented helper ──────────────────────────────────────────────────────

  function Seg<T extends string>({
    options,
    value,
    onChange,
  }: {
    options: { label: string; value: T }[];
    value: T;
    onChange: (v: T) => void;
  }) {
    return (
      <View style={styles.segmented}>
        {options.map((o) => (
          <TouchableOpacity
            key={o.value}
            style={[styles.segBtn, value === o.value && styles.segBtnActive]}
            onPress={() => onChange(o.value)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.segBtnText,
                value === o.value && styles.segBtnTextActive,
              ]}
            >
              {o.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  const switchThumb = theme.primary.main;
  const switchTrackOn = theme.primary.dark + "88";

  // ─── JSX ──────────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons
            name="chevron-back"
            size={26}
            color={theme.foreground.white}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* ── ACCOUNT ────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>Account</Text>
        </View>
        <View style={styles.sectionBody}>
          <SettingsRow
            icon="person-outline"
            iconBg="#1c3a5e"
            title="Edit Profile"
            subtitle="Change name, username, bio & avatar"
            showBorder
            showChevron
            onPress={() => router.push("/settings/edit-profile" as any)}
            styles={styles}
            theme={theme}
          />
          <SettingsRow
            icon="lock-closed-outline"
            iconBg="#3a1a5e"
            title="Change Password"
            subtitle="Update your login credentials"
            showBorder
            showChevron
            onPress={() => router.push("/settings/change-password" as any)}
            styles={styles}
            theme={theme}
          />
          <SettingsRow
            icon="eye-off-outline"
            iconBg="#1a3a3a"
            title="Private Account"
            subtitle="Only followers can see your content"
            showBorder={false}
            right={
              <Switch
                value={privateAccount}
                onValueChange={togglePrivate}
                thumbColor={switchThumb}
                trackColor={{ false: "#3a3a3a", true: switchTrackOn }}
              />
            }
            styles={styles}
            theme={theme}
          />
        </View>

        {/* ── APPEARANCE ─────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>Appearance</Text>
        </View>
        <View style={styles.sectionBody}>
          <SettingsRow
            icon="color-palette-outline"
            iconBg="#2a3a1a"
            title="Theme"
            subtitle={themeType === "male" ? "Male (Green)" : "Female (Blue)"}
            showBorder={false}
            right={
              <Seg
                options={[
                  { label: "Male", value: "male" },
                  { label: "Female", value: "female" },
                ]}
                value={themeType}
                onChange={(v) => handleTheme(v as ThemeType)}
              />
            }
            styles={styles}
            theme={theme}
          />
        </View>

        {/* ── PREFERENCES ────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>Preferences</Text>
        </View>
        <View style={styles.sectionBody}>
          <SettingsRow
            icon="scale-outline"
            iconBg="#3a2a1a"
            title="Weight Unit"
            showBorder
            right={
              <Seg
                options={[
                  { label: "kg", value: "kg" },
                  { label: "lbs", value: "lbs" },
                ]}
                value={weightUnit}
                onChange={changeWeightUnit}
              />
            }
            styles={styles}
            theme={theme}
          />
          <SettingsRow
            icon="navigate-outline"
            iconBg="#1a2a3a"
            title="Distance Unit"
            showBorder
            right={
              <Seg
                options={[
                  { label: "km", value: "km" },
                  { label: "mi", value: "mi" },
                ]}
                value={distanceUnit}
                onChange={changeDistanceUnit}
              />
            }
            styles={styles}
            theme={theme}
          />
          <SettingsRow
            icon="calendar-outline"
            iconBg="#1a3a2a"
            title="First Day of Week"
            showBorder={false}
            right={
              <Seg
                options={[
                  { label: "Mon", value: "mon" },
                  { label: "Sun", value: "sun" },
                ]}
                value={weekStart}
                onChange={changeWeekStart}
              />
            }
            styles={styles}
            theme={theme}
          />
        </View>

        {/* ── NOTIFICATIONS ───────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>Notifications</Text>
        </View>
        <View style={styles.sectionBody}>
          <SettingsRow
            icon="notifications-outline"
            iconBg="#3a1a2a"
            title="Push Notifications"
            subtitle="Likes, comments and follows"
            showBorder
            right={
              <Switch
                value={pushNotifs}
                onValueChange={togglePush}
                thumbColor={switchThumb}
                trackColor={{ false: "#3a3a3a", true: switchTrackOn }}
              />
            }
            styles={styles}
            theme={theme}
          />
          <SettingsRow
            icon="alarm-outline"
            iconBg="#2a3a1a"
            title="Workout Reminders"
            subtitle="Daily nudges to stay consistent"
            showBorder
            right={
              <Switch
                value={workoutReminders}
                onValueChange={toggleReminders}
                thumbColor={switchThumb}
                trackColor={{ false: "#3a3a3a", true: switchTrackOn }}
              />
            }
            styles={styles}
            theme={theme}
          />
          <SettingsRow
            icon="mail-outline"
            iconBg="#1a2a3a"
            title="Email Notifications"
            subtitle="Weekly summaries & news"
            showBorder={false}
            right={
              <Switch
                value={emailNotifs}
                onValueChange={toggleEmail}
                thumbColor={switchThumb}
                trackColor={{ false: "#3a3a3a", true: switchTrackOn }}
              />
            }
            styles={styles}
            theme={theme}
          />
        </View>

        {/* ── CONNECTED APPS ───────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>Connected Apps</Text>
        </View>
        <View style={styles.sectionBody}>
          <SettingsRow
            icon="heart-outline"
            iconBg="#3a1a1a"
            title="Health Connect"
            subtitle="Sync steps, calories & heart rate"
            showBorder={false}
            right={
              <Switch
                value={healthConnect}
                onValueChange={toggleHealth}
                thumbColor={switchThumb}
                trackColor={{ false: "#3a3a3a", true: switchTrackOn }}
              />
            }
            styles={styles}
            theme={theme}
          />
        </View>

        {/* ── SUPPORT ─────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>Support</Text>
        </View>
        <View style={styles.sectionBody}>
          <SettingsRow
            icon="help-circle-outline"
            iconBg="#1c3a5e"
            title="Help Center"
            showBorder
            showChevron
            onPress={() => router.push("/settings/help-center" as any)}
            styles={styles}
            theme={theme}
          />
          <SettingsRow
            icon="star-outline"
            iconBg="#3a3a1a"
            title="Rate Hylift"
            subtitle="Love the app? Leave us a review"
            showBorder
            showChevron
            onPress={() => {}}
            styles={styles}
            theme={theme}
          />
          <SettingsRow
            icon="information-circle-outline"
            iconBg="#2a2a3a"
            title="About Hylift"
            subtitle="Version 1.0.0"
            showBorder
            showChevron
            onPress={() => router.push("/settings/about" as any)}
            styles={styles}
            theme={theme}
          />
          <SettingsRow
            icon="document-text-outline"
            iconBg="#1a3a3a"
            title="Terms of Service"
            showBorder
            showChevron
            onPress={() => router.push("/settings/terms" as any)}
            styles={styles}
            theme={theme}
          />
          <SettingsRow
            icon="shield-checkmark-outline"
            iconBg="#2a1a3a"
            title="Privacy Policy"
            showBorder={false}
            showChevron
            onPress={() => router.push("/settings/privacy" as any)}
            styles={styles}
            theme={theme}
          />
        </View>

        {/* ── DANGER ZONE ─────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionLabel, { color: "#f87171" }]}>
            Account Actions
          </Text>
        </View>
        <View style={styles.dangerSection}>
          <TouchableOpacity
            style={[styles.dangerRow, styles.rowBorder]}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={20} color="#f87171" />
            <Text style={[styles.dangerText, { color: "#f87171" }]}>
              Log Out
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dangerRow}
            onPress={handleDeleteAccount}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
            <Text style={[styles.dangerText, { color: "#ef4444" }]}>
              Delete Account
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>Hylift v1.0.0 · Built with ♥</Text>
      </ScrollView>
    </View>
  );
}
