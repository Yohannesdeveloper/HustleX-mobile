/**
 * React Native Login Screen
 * Complete conversion maintaining exact UI/UX
 */

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../store/hooks";
import { useAppSelector } from "../store/hooks";
import { useTranslation } from "../hooks/useTranslation";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

const Login: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { login, addRole: addRoleToUser } = useAuth();
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const t = useTranslation();

  const routeParams = (route.params as any) || {};
  const redirectPath = routeParams.redirect || "JobListings";
  const prefilledEmail = routeParams.email || "";
  const suggestedRole = routeParams.suggestedRole;
  const fromSignup = routeParams.fromSignup;
  const addRole = routeParams.addRole;
  const signupMessage = routeParams.message;

  const [email, setEmail] = useState(prefilledEmail);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      Alert.alert("Coming Soon", "Google login will be implemented soon. Please use email/password.");
    } catch (err) {
      console.error(err);
      setError(t.login.googleLoginFailed);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate("ForgotPassword" as never);
  };

  const handleSubmit = async () => {
    setError(null);
    setResetMessage(null);
    setIsLoading(true);

    try {
      const loggedInUser = await login(email, password);
      console.log("Login successful");

      // Handle add role flow
      if (addRole && !loggedInUser.roles?.includes(addRole)) {
        try {
          await addRoleToUser(addRole);
          console.log(`Added ${addRole} role successfully`);

          // Navigate to the appropriate setup page for the new role
          if (addRole === 'freelancer') {
            navigation.navigate("FreelancerProfileSetup" as never);
            setIsLoading(false);
            return;
          } else if (addRole === 'client') {
            navigation.navigate("CompanyProfile" as never);
            setIsLoading(false);
            return;
          }
        } catch (roleError) {
          console.error('Error adding role:', roleError);
          setError('Failed to add role. Please try again.');
          setIsLoading(false);
          return;
        }
      }

      // Determine redirect path based on user role and profile completion
      let finalRedirectPath = redirectPath;

      if (!routeParams.redirect) {
        // Check if user has multiple roles - if so, go to role selection
        if (loggedInUser.roles && loggedInUser.roles.length > 1) {
          finalRedirectPath = "RoleSelection";
        } else if (loggedInUser.currentRole === "freelancer") {
          if (loggedInUser.profile?.isProfileComplete) {
            finalRedirectPath = "FreelancingDashboard";
          } else {
            finalRedirectPath = "FreelancerProfileSetup";
          }
        } else if (loggedInUser.currentRole === "client") {
          finalRedirectPath = "HiringDashboard";
        } else {
          // No current role set, go to role selection
          finalRedirectPath = "RoleSelection";
        }
      }

      navigation.navigate(finalRedirectPath as never);
    } catch (err: any) {
      console.error(err);
      setError(err.message || t.login.incorrectEmailOrPassword);
    } finally {
      setIsLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: darkMode ? "#000000" : "#f0f9ff",
    },
    scrollView: {
      flex: 1,
    },
    content: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    card: {
      width: "100%",
      maxWidth: 400,
      backgroundColor: darkMode ? "rgba(0, 0, 0, 0.4)" : "rgba(255, 255, 255, 0.8)",
      borderRadius: 24,
      padding: 32,
      borderWidth: 1,
      borderColor: darkMode ? "rgba(6, 182, 212, 0.2)" : "rgba(6, 182, 212, 0.1)",
      ...Platform.select({
        web: {
          boxShadow: "0 4px 12px rgba(6, 182, 212, 0.3)",
        },
        default: {
          shadowColor: "#06b6d4",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 8,
        },
      }),
    },
    title: {
      fontSize: 28,
      fontWeight: "800",
      color: darkMode ? "#06b6d4" : "#06b6d4",
      textAlign: "center",
      marginBottom: 24,
    },
    messageBox: {
      padding: 16,
      borderRadius: 12,
      marginBottom: 20,
      borderWidth: 1,
      backgroundColor: darkMode ? "rgba(6, 182, 212, 0.1)" : "rgba(6, 182, 212, 0.05)",
      borderColor: darkMode ? "rgba(6, 182, 212, 0.3)" : "rgba(6, 182, 212, 0.2)",
    },
    messageText: {
      fontSize: 14,
      color: darkMode ? "#67e8f9" : "#0891b2",
    },
    socialButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
      backgroundColor: darkMode ? "rgba(17, 24, 39, 0.5)" : "rgba(243, 244, 246, 0.5)",
      borderColor: darkMode ? "rgba(55, 65, 81, 0.5)" : "rgba(209, 213, 219, 0.5)",
      opacity: 0.5,
    },
    socialButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: darkMode ? "#ffffff" : "#374151",
      marginLeft: 12,
    },
    divider: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 24,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: darkMode ? "rgba(75, 85, 99, 0.5)" : "rgba(209, 213, 219, 0.5)",
    },
    dividerText: {
      paddingHorizontal: 16,
      fontSize: 14,
      color: darkMode ? "#d1d5db" : "#6b7280",
      backgroundColor: darkMode ? "rgba(0, 0, 0, 0.4)" : "rgba(255, 255, 255, 0.8)",
    },
    input: {
      width: "100%",
      height: 56,
      backgroundColor: darkMode ? "rgba(17, 24, 39, 0.5)" : "rgba(255, 255, 255, 0.5)",
      borderRadius: 12,
      paddingHorizontal: 16,
      fontSize: 16,
      color: darkMode ? "#ffffff" : "#111827",
      borderWidth: 1,
      borderColor: darkMode ? "rgba(55, 65, 81, 0.5)" : "rgba(209, 213, 219, 0.5)",
      marginBottom: 16,
    },
    inputFocused: {
      borderColor: "#06b6d4",
      borderWidth: 2,
    },
    passwordContainer: {
      flexDirection: "row",
      alignItems: "center",
      position: "relative",
    },
    passwordInput: {
      flex: 1,
    },
    passwordToggle: {
      position: "absolute",
      right: 16,
      padding: 8,
    },
    forgotPassword: {
      alignSelf: "flex-end",
      marginBottom: 20,
    },
    forgotPasswordText: {
      fontSize: 14,
      color: "#06b6d4",
      textDecorationLine: "underline",
    },
    errorBox: {
      backgroundColor: "rgba(239, 68, 68, 0.1)",
      borderWidth: 1,
      borderColor: "rgba(239, 68, 68, 0.2)",
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
    },
    errorText: {
      color: "#ef4444",
      fontSize: 14,
      fontWeight: "600",
    },
    successBox: {
      backgroundColor: "rgba(34, 197, 94, 0.1)",
      borderWidth: 1,
      borderColor: "rgba(34, 197, 94, 0.2)",
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
    },
    successText: {
      color: "#22c55e",
      fontSize: 14,
      fontWeight: "600",
    },
    submitButton: {
      width: "100%",
      paddingVertical: 16,
      borderRadius: 12,
      backgroundColor: "#06b6d4",
      alignItems: "center",
      justifyContent: "center",
      ...Platform.select({
        web: {
          boxShadow: "0 4px 8px rgba(6, 182, 212, 0.3)",
        },
        default: {
          shadowColor: "#06b6d4",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 4,
        },
      }),
    },
    submitButtonDisabled: {
      opacity: 0.5,
    },
    submitButtonText: {
      fontSize: 16,
      fontWeight: "700",
      color: "#ffffff",
    },
    signupLink: {
      marginTop: 24,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },
    signupLinkText: {
      fontSize: 14,
      color: darkMode ? "#d1d5db" : "#4b5563",
    },
    signupLinkButton: {
      marginLeft: 4,
    },
    signupLinkButtonText: {
      fontSize: 14,
      color: "#06b6d4",
      textDecorationLine: "underline",
      fontWeight: "600",
    },
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeIn.duration(600)} style={styles.card}>
          <Text style={styles.title}>Login</Text>

          {signupMessage && (
            <View style={styles.messageBox}>
              <Text style={styles.messageText}>{signupMessage}</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.socialButton}
            onPress={handleGoogleLogin}
            disabled={true}
          >
            <Ionicons name="logo-google" size={20} color="#4285F4" />
            <Text style={styles.socialButtonText}>
              {t.login.signInWithGoogle} {t.login.comingSoon}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.socialButton}
            disabled={true}
          >
            <Ionicons name="logo-apple" size={20} color={darkMode ? "#ffffff" : "#000000"} />
            <Text style={styles.socialButtonText}>
              {t.login.signInWithApple} {t.login.comingSoon}
            </Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Use your email</Text>
            <View style={styles.dividerLine} />
          </View>

          <TextInput
            style={styles.input}
            placeholder={t.login.email}
            placeholderTextColor={darkMode ? "#9ca3af" : "#6b7280"}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            required
          />

          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder={t.login.password}
              placeholderTextColor={darkMode ? "#9ca3af" : "#6b7280"}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              required
            />
            <TouchableOpacity
              style={styles.passwordToggle}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color={darkMode ? "#9ca3af" : "#6b7280"}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={handleForgotPassword}
          >
            <Text style={styles.forgotPasswordText}>
              {t.login.forgotPassword}
            </Text>
          </TouchableOpacity>

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {resetMessage && (
            <View style={styles.successBox}>
              <Text style={styles.successText}>{resetMessage}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.submitButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.signupLink}>
            <Text style={styles.signupLinkText}>{t.login.dontHaveAccount} </Text>
            <TouchableOpacity
              style={styles.signupLinkButton}
              onPress={() => navigation.navigate("Signup" as never, routeParams as never)}
            >
              <Text style={styles.signupLinkButtonText}>{t.login.signUp}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Login;
