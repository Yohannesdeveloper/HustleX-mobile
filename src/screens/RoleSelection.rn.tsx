/**
 * React Native RoleSelection Screen
 * Complete conversion maintaining exact UI/UX
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../store/hooks";
import { useAppSelector } from "../store/hooks";
import { Alert } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

const RoleSelection: React.FC = () => {
  const navigation = useNavigation();
  const { isAuthenticated, user, switchRole } = useAuth();
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const [selectedRole, setSelectedRole] = useState<"freelancer" | "client" | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigation.navigate("Signup" as never, { redirect: "RoleSelection" } as never);
      return;
    }
  }, [isAuthenticated, navigation]);

  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#06b6d4" />
        <Text style={{ marginTop: 16, color: darkMode ? "#ffffff" : "#000000" }}>
          Checking authentication...
        </Text>
      </View>
    );
  }

  const handleRoleSelect = async (role: "freelancer" | "client") => {
    setSelectedRole(role);
    setSaving(true);

    try {
      await switchRole(role);
      setTimeout(() => {
        if (role === "freelancer") {
          if (user?.profile?.isProfileComplete) {
            navigation.navigate("FreelancingDashboard" as never);
          } else {
            navigation.navigate("FreelancerProfileSetup" as never);
          }
        } else if (role === "client") {
          navigation.navigate("HiringDashboard" as never);
        }
      }, 1000);
    } catch (error) {
      console.error("Error selecting role:", error);
      Alert.alert("Error", "Failed to set your role. Please try again.");
      setSaving(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: darkMode ? "#000000" : "#ffffff",
    },
    scrollView: {
      flex: 1,
    },
    content: {
      padding: 24,
      paddingTop: 80,
    },
    header: {
      alignItems: "center",
      marginBottom: 48,
    },
    headerTitle: {
      fontSize: 36,
      fontWeight: "800",
      color: "#06b6d4",
      marginBottom: 16,
      textAlign: "center",
    },
    headerSubtitle: {
      fontSize: 18,
      color: darkMode ? "#d1d5db" : "#4b5563",
      textAlign: "center",
      maxWidth: 600,
    },
    cardsContainer: {
      gap: 24,
      marginBottom: 48,
    },
    card: {
      borderRadius: 24,
      padding: 32,
      borderWidth: 2,
      ...Platform.select({
        web: {
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
        },
        default: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 8,
        },
      }),
    },
    cardFreelancer: {
      backgroundColor: darkMode ? "rgba(0, 0, 0, 0.4)" : "rgba(255, 255, 255, 0.4)",
      borderColor: darkMode ? "rgba(6, 182, 212, 0.2)" : "rgba(6, 182, 212, 0.1)",
    },
    cardFreelancerSelected: {
      backgroundColor: darkMode ? "rgba(6, 182, 212, 0.1)" : "rgba(6, 182, 212, 0.05)",
      borderColor: darkMode ? "rgba(6, 182, 212, 0.5)" : "rgba(6, 182, 212, 0.5)",
    },
    cardClient: {
      backgroundColor: darkMode ? "rgba(0, 0, 0, 0.4)" : "rgba(255, 255, 255, 0.4)",
      borderColor: darkMode ? "rgba(34, 197, 94, 0.2)" : "rgba(34, 197, 94, 0.1)",
    },
    cardClientSelected: {
      backgroundColor: darkMode ? "rgba(34, 197, 94, 0.1)" : "rgba(34, 197, 94, 0.05)",
      borderColor: darkMode ? "rgba(34, 197, 94, 0.5)" : "rgba(34, 197, 94, 0.5)",
    },
    checkBadge: {
      position: "absolute",
      top: 16,
      right: 16,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: "#06b6d4",
      justifyContent: "center",
      alignItems: "center",
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
      marginBottom: 24,
    },
    iconContainer: {
      width: 64,
      height: 64,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
    },
    iconContainerFreelancer: {
      backgroundColor: darkMode ? "rgba(6, 182, 212, 0.1)" : "rgba(6, 182, 212, 0.05)",
    },
    iconContainerFreelancerSelected: {
      backgroundColor: "rgba(6, 182, 212, 0.2)",
    },
    iconContainerClient: {
      backgroundColor: darkMode ? "rgba(34, 197, 94, 0.1)" : "rgba(34, 197, 94, 0.05)",
    },
    iconContainerClientSelected: {
      backgroundColor: "rgba(34, 197, 94, 0.2)",
    },
    cardTitle: {
      fontSize: 24,
      fontWeight: "800",
      marginBottom: 4,
    },
    cardTitleFreelancer: {
      color: darkMode ? "#06b6d4" : "#06b6d4",
    },
    cardTitleClient: {
      color: darkMode ? "#22c55e" : "#22c55e",
    },
    cardSubtitle: {
      fontSize: 14,
      color: darkMode ? "#9ca3af" : "#6b7280",
    },
    featuresList: {
      marginBottom: 24,
    },
    featureItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 16,
    },
    featureIcon: {
      width: 20,
      height: 20,
    },
    featureText: {
      fontSize: 14,
      color: darkMode ? "#d1d5db" : "#374151",
    },
    perfectForBox: {
      padding: 16,
      borderRadius: 12,
      marginBottom: 24,
    },
    perfectForBoxDark: {
      backgroundColor: "rgba(17, 24, 39, 0.5)",
    },
    perfectForBoxLight: {
      backgroundColor: "rgba(243, 244, 246, 0.5)",
    },
    perfectForTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: darkMode ? "#ffffff" : "#111827",
      marginBottom: 8,
    },
    perfectForList: {
      gap: 4,
    },
    perfectForItem: {
      fontSize: 14,
      color: darkMode ? "#d1d5db" : "#4b5563",
    },
    cardButton: {
      width: "100%",
      paddingVertical: 16,
      borderRadius: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    cardButtonFreelancer: {
      backgroundColor: "#06b6d4",
    },
    cardButtonClient: {
      backgroundColor: "#22c55e",
    },
    cardButtonDisabled: {
      opacity: 0.5,
    },
    cardButtonText: {
      fontSize: 16,
      fontWeight: "700",
      color: "#ffffff",
    },
    footer: {
      alignItems: "center",
      marginTop: 24,
    },
    footerText: {
      fontSize: 14,
      color: darkMode ? "#9ca3af" : "#6b7280",
      textAlign: "center",
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Animated.View entering={FadeIn.duration(600)} style={styles.header}>
          <Text style={styles.headerTitle}>Choose Your Path</Text>
          <Text style={styles.headerSubtitle}>
            Select how you want to use HustleX and start building your professional journey
          </Text>
        </Animated.View>

        <View style={styles.cardsContainer}>
          {user?.roles?.includes("freelancer") && (
            <Animated.View
              entering={FadeIn.duration(600).delay(200)}
              style={[
                styles.card,
                styles.cardFreelancer,
                selectedRole === "freelancer" && styles.cardFreelancerSelected,
              ]}
            >
              {selectedRole === "freelancer" && (
                <View style={styles.checkBadge}>
                  <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
                </View>
              )}

              <TouchableOpacity
                style={styles.cardHeader}
                onPress={() => !saving && handleRoleSelect("freelancer")}
                disabled={saving}
              >
                <View
                  style={[
                    styles.iconContainer,
                    styles.iconContainerFreelancer,
                    selectedRole === "freelancer" && styles.iconContainerFreelancerSelected,
                  ]}
                >
                  <Ionicons name="person" size={32} color="#06b6d4" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, styles.cardTitleFreelancer]}>
                    I'm a Freelancer
                  </Text>
                  <Text style={styles.cardSubtitle}>Offer your skills and services</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <Ionicons name="briefcase" size={20} color="#06b6d4" />
                  <Text style={styles.featureText}>Browse and apply to jobs</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="trending-up" size={20} color="#22c55e" />
                  <Text style={styles.featureText}>Build your portfolio and reputation</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="star" size={20} color="#fbbf24" />
                  <Text style={styles.featureText}>Get rated and earn more</Text>
                </View>
              </View>

              <View style={[styles.perfectForBox, darkMode ? styles.perfectForBoxDark : styles.perfectForBoxLight]}>
                <Text style={styles.perfectForTitle}>Perfect for:</Text>
                <View style={styles.perfectForList}>
                  <Text style={styles.perfectForItem}>• Web Developers</Text>
                  <Text style={styles.perfectForItem}>• Graphic Designers</Text>
                  <Text style={styles.perfectForItem}>• Content Writers</Text>
                  <Text style={styles.perfectForItem}>• Marketing Specialists</Text>
                  <Text style={styles.perfectForItem}>• And many more professionals</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.cardButton,
                  styles.cardButtonFreelancer,
                  saving && styles.cardButtonDisabled,
                ]}
                onPress={() => handleRoleSelect("freelancer")}
                disabled={saving}
              >
                {saving && selectedRole === "freelancer" ? (
                  <>
                    <ActivityIndicator color="#ffffff" />
                    <Text style={styles.cardButtonText}>Setting up your profile...</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.cardButtonText}>Continue as Freelancer</Text>
                    <Ionicons name="arrow-forward" size={20} color="#ffffff" />
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>
          )}

          {user?.roles?.includes("client") && (
            <Animated.View
              entering={FadeIn.duration(600).delay(400)}
              style={[
                styles.card,
                styles.cardClient,
                selectedRole === "client" && styles.cardClientSelected,
              ]}
            >
              {selectedRole === "client" && (
                <View style={[styles.checkBadge, { backgroundColor: "#22c55e" }]}>
                  <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
                </View>
              )}

              <TouchableOpacity
                style={styles.cardHeader}
                onPress={() => !saving && handleRoleSelect("client")}
                disabled={saving}
              >
                <View
                  style={[
                    styles.iconContainer,
                    styles.iconContainerClient,
                    selectedRole === "client" && styles.iconContainerClientSelected,
                  ]}
                >
                  <Ionicons name="business" size={32} color="#22c55e" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, styles.cardTitleClient]}>I'm a Client</Text>
                  <Text style={styles.cardSubtitle}>Hire talented freelancers</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <Ionicons name="people" size={20} color="#22c55e" />
                  <Text style={styles.featureText}>Post jobs and find talent</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="briefcase" size={20} color="#3b82f6" />
                  <Text style={styles.featureText}>Manage projects and applications</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="trending-up" size={20} color="#a855f7" />
                  <Text style={styles.featureText}>Scale your business with experts</Text>
                </View>
              </View>

              <View style={[styles.perfectForBox, darkMode ? styles.perfectForBoxDark : styles.perfectForBoxLight]}>
                <Text style={styles.perfectForTitle}>Perfect for:</Text>
                <View style={styles.perfectForList}>
                  <Text style={styles.perfectForItem}>• Startups and Businesses</Text>
                  <Text style={styles.perfectForItem}>• Project Managers</Text>
                  <Text style={styles.perfectForItem}>• Entrepreneurs</Text>
                  <Text style={styles.perfectForItem}>• Companies seeking talent</Text>
                  <Text style={styles.perfectForItem}>• Anyone needing professional services</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.cardButton,
                  styles.cardButtonClient,
                  saving && styles.cardButtonDisabled,
                ]}
                onPress={() => handleRoleSelect("client")}
                disabled={saving}
              >
                {saving && selectedRole === "client" ? (
                  <>
                    <ActivityIndicator color="#ffffff" />
                    <Text style={styles.cardButtonText}>Setting up your profile...</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.cardButtonText}>Continue as Client</Text>
                    <Ionicons name="arrow-forward" size={20} color="#ffffff" />
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>

        <Animated.View entering={FadeIn.duration(600).delay(700)} style={styles.footer}>
          <Text style={styles.footerText}>
            You can always switch between roles or update your profile settings later.
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

export default RoleSelection;
