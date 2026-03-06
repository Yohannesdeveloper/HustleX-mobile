/**
 * React Native Signup/Login Screen
 * Complete conversion maintaining exact UI/UX
 */

import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../store/hooks";
import { useAppSelector } from "../store/hooks";
import { useTranslation } from "../hooks/useTranslation";
import apiService from "../services/api-react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

const Signup: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { register, login, addRole, switchRole, isAuthenticated } = useAuth();
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const t = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"freelancer" | "client" | "admin">("freelancer");

  React.useEffect(() => {
    if (isAuthenticated) {
      navigation.reset({
        index: 0,
        routes: [{ name: "MainSwipeableTabs" as never }],
      });
    }
  }, [isAuthenticated, navigation]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [existingUser, setExistingUser] = useState<any>(null);
  const [checkingUser, setCheckingUser] = useState(false);
  const [selectedRoleForLogin, setSelectedRoleForLogin] = useState<string | null>(null);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const emailCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const emailInputRef = useRef<TextInput>(null);

  const redirectPath = (route.params as any)?.redirect || "JobListings";

  const checkExistingUser = async (emailToCheck: string) => {
    if (!emailToCheck || !emailToCheck.includes('@')) {
      setExistingUser(null);
      return;
    }

    setCheckingUser(true);
    setError(null);
    try {
      console.log('Checking existing user for:', emailToCheck);
      const result = await apiService.checkUser(emailToCheck);

      if (result && result.user) {
        console.log('Existing user found:', result.user);
        setExistingUser(result.user);
      } else {
        console.log('User not found - showing create form');
        setExistingUser(null);
      }
    } catch (err: any) {
      console.error('Error checking existing user:', err);
      // Network errors are expected if backend is offline - don't show to user
      // Just allow them to proceed with signup
      setExistingUser(null);
    } finally {
      setCheckingUser(false);
    }
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    setExistingUser(null);
    setShowLoginForm(false);
    setSelectedRoleForLogin(null);
    setPassword("");
    setError(null);

    // Clear previous timeout
    if (emailCheckTimeoutRef.current) {
      clearTimeout(emailCheckTimeoutRef.current);
    }

    // Debounce the check - wait 1 second after user stops typing
    emailCheckTimeoutRef.current = setTimeout(() => {
      const normalizedEmail = text.toLowerCase().replace(/\s/g, "");
      if (normalizedEmail === "hustlexet@gmail.com") {
        setRole("admin");
      } else if (role === "admin") {
        setRole("freelancer");
      }

      // Only check if email is valid
      if (text.includes("@") && text.length > 5) {
        checkExistingUser(text);
      }
    }, 1000);
  };

  const handleAccountSelection = async (selectedRole: string) => {
    setSelectedRoleForLogin(selectedRole);
    setShowLoginForm(true);
    setError(null);
  };

  const handleAddRole = async (newRole: 'freelancer' | 'client') => {
    setSelectedRoleForLogin(newRole);
    setRole(newRole); // Set the role to the new role
    setShowLoginForm(false); // Show signup form instead of login form
    // Don't clear existingUser, but set a flag to indicate we're adding a role
    setError(null);
  };

  const handleLogin = async () => {
    setError(null);

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setIsLoading(true);
    try {
      const loggedInUser = await login(email, password);

      // Determine the role to use (selected role or current role)
      const targetRole = selectedRoleForLogin || loggedInUser?.currentRole || 'freelancer';

      // If adding a new role, add it after login
      if (selectedRoleForLogin && !existingUser.roles?.includes(selectedRoleForLogin)) {
        try {
          await addRole(selectedRoleForLogin as 'freelancer' | 'client');
        } catch (roleError: any) {
          console.error('Error adding role:', roleError);
          // Continue anyway - user can add role later
        }
      } else if (selectedRoleForLogin && loggedInUser?.currentRole !== selectedRoleForLogin) {
        // Switch to selected role if different from current
        try {
          await switchRole(selectedRoleForLogin as 'freelancer' | 'client');
        } catch (switchError: any) {
          console.error('Error switching role:', switchError);
          // Continue anyway
        }
      }

      // Navigate based on role and profile completion status
      // Navigate to HomeFinal (MainSwipeableTabs)
      navigation.reset({
        index: 0,
        routes: [{ name: "MainSwipeableTabs" as never }],
      });
    } catch (err: any) {
      console.error('Login error:', err);
      let errorMessage = "Invalid email or password. Please try again.";

      // Check for network/connection errors
      if (err?.message?.includes('Failed to fetch') ||
        err?.message?.includes('Network Error') ||
        err?.code === 'ERR_NETWORK' ||
        err?.name === 'TypeError') {
        errorMessage = "Cannot connect to server. Please make sure the backend server is running on port 5000.";
      } else if (err) {
        if (typeof err === 'string') {
          errorMessage = err;
        } else if (err?.message) {
          errorMessage = err.message;
        } else if (err?.error?.message) {
          errorMessage = err.error.message;
        } else if (err?.response?.data?.message) {
          errorMessage = err.response.data.message;
        }
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    setError(null);

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (selectedRoleForLogin) {
      // When adding a role, we need the password to authenticate the existing user
      if (!password) {
        setError("Please enter your password to authenticate your account.");
        return;
      }
    } else {
      // For new account creation, validate password confirmation and strength
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      // Strong password validation for new account creation
      const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;
      if (!passwordRegex.test(password)) {
        setError("Password must be at least 8 characters long and contain at least one letter and one number");
        return;
      }
    }

    if (!firstName || !lastName) {
      setError("Please enter your name.");
      return;
    }

    setIsLoading(true);
    try {
      if (selectedRoleForLogin) {
        // Adding a new role to existing account
        // First, login with the existing account credentials
        const loggedInUser = await login(email, password); // Use the entered password

        // Then add the new role to the account
        await addRole(selectedRoleForLogin as 'freelancer' | 'client');

        console.log(`Successfully added ${selectedRoleForLogin} role to account`);

        // Redirect based on the new role
        // Redirect to HomeFinal
        navigation.reset({
          index: 0,
          routes: [{ name: "MainSwipeableTabs" as never }],
        });
      } else {
        // Original flow for new user registration
        await register({
          email,
          password,
          role,
          firstName,
          lastName,
        });

        console.log("Registration successful");
        // Redirect to appropriate wizard based on role
        // Redirect to HomeFinal
        navigation.reset({
          index: 0,
          routes: [{ name: "MainSwipeableTabs" as never }],
        });
      }
    } catch (err: any) {
      let errorMessage = selectedRoleForLogin
        ? "Failed to add role. Please check your password and try again."
        : "Failed to create account. Please try again.";

      // Check for network/connection errors
      if (err?.message?.includes('Failed to fetch') ||
        err?.message?.includes('Network Error') ||
        err?.code === 'ERR_NETWORK' ||
        err?.name === 'TypeError') {
        errorMessage = "Cannot connect to server. Please make sure the backend server is running on port 5000.";
      } else if (err) {
        // Try to extract error message from various possible locations
        if (typeof err === 'string') {
          errorMessage = err;
        } else if (err?.response?.status === 429) {
          errorMessage = "Too many requests. Please try again later.";
        } else if (err?.errorData?.errors && Array.isArray(err.errorData.errors)) {
          // Handle express-validator errors
          errorMessage = err.errorData.errors.map((e: any) => e.msg).join('; ');
        } else if (err?.response?.data?.message) {
          // Axios-style error
          errorMessage = err.response.data.message;
        } else if (err?.errorData?.message) {
          // Fetch API error with errorData
          errorMessage = err.errorData.message;
        } else if (err?.message) {
          // Standard Error object
          errorMessage = err.message;
        } else if (err?.error?.message) {
          errorMessage = err.error.message;
        }

        // Specific handling for invalid credentials when adding a role
        if (selectedRoleForLogin && (err?.message?.includes('Invalid credentials') ||
          err?.response?.data?.message?.includes('Invalid credentials'))) {
          errorMessage = "Invalid password. Please enter the correct password for your existing account.";
        }
      }

      setError(errorMessage);
      console.error('Submission error:', err);
      // Log additional error details for debugging
      if (err?.errorData) {
        console.error('Error data:', err.errorData);
      }
      if (err?.status) {
        console.error('Error status:', err.status);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: darkMode ? '#000000' : '#f0f9ff',
    },
    scrollView: {
      flex: 1,
    },
    content: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    card: {
      width: '100%',
      maxWidth: 400,
      backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
      borderRadius: 20,
      padding: 24,
      ...(Platform.OS === 'web' ? {
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
      } : {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      }),
    },
    title: {
      fontSize: 32,
      fontWeight: '800',
      color: darkMode ? '#06b6d4' : '#0891b2',
      marginBottom: 8,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      color: darkMode ? '#9ca3af' : '#6b7280',
      marginBottom: 32,
      textAlign: 'center',
    },
    input: {
      width: '100%',
      height: 50,
      backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
      borderRadius: 12,
      paddingHorizontal: 16,
      fontSize: 16,
      color: darkMode ? '#ffffff' : '#000000',
      marginBottom: 16,
      borderWidth: 1,
      borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      ...Platform.select({
        web: {
          overflow: 'hidden',
        },
      }),
    },
    passwordContainer: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
      borderRadius: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    },
    passwordInput: {
      flex: 1,
      height: 50,
      paddingHorizontal: 16,
      fontSize: 16,
      color: darkMode ? '#ffffff' : '#000000',
    },
    eyeIcon: {
      paddingHorizontal: 12,
    },
    inputRow: {
      flexDirection: 'row',
      gap: 12,
    },
    inputHalf: {
      flex: 1,
      minWidth: 0,
      ...Platform.select({
        web: {
          overflow: 'visible',
        },
      }),
    },
    inputSmall: {
      fontSize: 14,
    },
    button: {
      width: '100%',
      height: 50,
      backgroundColor: '#06b6d4',
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 8,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    buttonText: {
      color: '#ffffff',
      fontSize: 18,
      fontWeight: '700',
    },
    errorText: {
      color: '#ef4444',
      fontSize: 14,
      marginTop: 8,
      marginBottom: 8,
      textAlign: 'center',
      backgroundColor: darkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.1)',
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: 'rgba(239, 68, 68, 0.2)',
    },
    linkText: {
      color: '#06b6d4',
      fontSize: 14,
      marginTop: 16,
      textAlign: 'center',
    },
    roleSelector: {
      flexDirection: 'row',
      marginBottom: 24,
      backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
      borderRadius: 12,
      padding: 6,
      gap: 6,
    },
    roleButton: {
      flex: 1,
      height: 48,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    roleButtonActive: {
      backgroundColor: '#06b6d4',
    },
    roleButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: darkMode ? '#ffffff' : '#000000',
    },
    roleButtonTextActive: {
      color: '#ffffff',
    },
    accountSelectionContainer: {
      backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    },
    accountSelectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: darkMode ? '#ffffff' : '#000000',
      marginBottom: 8,
    },
    accountSelectionSubtitle: {
      fontSize: 14,
      color: darkMode ? '#9ca3af' : '#6b7280',
      marginBottom: 16,
    },
    existingRoleButton: {
      width: '100%',
      padding: 12,
      borderRadius: 8,
      marginBottom: 8,
      borderWidth: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    existingRoleButtonFreelancer: {
      backgroundColor: darkMode ? 'rgba(6, 182, 212, 0.1)' : 'rgba(6, 182, 212, 0.05)',
      borderColor: darkMode ? 'rgba(6, 182, 212, 0.3)' : 'rgba(6, 182, 212, 0.2)',
    },
    existingRoleButtonClient: {
      backgroundColor: darkMode ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.05)',
      borderColor: darkMode ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.2)',
    },
    roleButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    existingRoleButtonText: {
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    },
    roleButtonTextFreelancer: {
      color: darkMode ? '#06b6d4' : '#0891b2',
    },
    roleButtonTextClient: {
      color: darkMode ? '#22c55e' : '#16a34a',
    },
    divider: {
      height: 1,
      backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      marginVertical: 16,
    },
    addRoleSection: {
      marginTop: 8,
    },
    addRoleTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: darkMode ? '#9ca3af' : '#6b7280',
      marginBottom: 8,
    },
    backButton: {
      marginTop: 12,
      paddingVertical: 8,
    },
    backButtonText: {
      fontSize: 14,
      color: darkMode ? '#9ca3af' : '#6b7280',
      textAlign: 'center',
    },
    checkingIndicator: {
      position: 'absolute',
      right: 16,
      top: 16,
    },
    existingRoleButtonAdmin: {
      backgroundColor: darkMode ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)',
      borderColor: darkMode ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.2)',
    },
    roleButtonTextAdmin: {
      color: darkMode ? '#a78bfa' : '#7c3aed',
    },
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={[styles.scrollView, darkMode && { backgroundColor: '#000' }]}
        contentContainerStyle={[styles.content, darkMode && { backgroundColor: '#000' }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.title}>
            {selectedRoleForLogin && !showLoginForm ? `Add ${selectedRoleForLogin.charAt(0).toUpperCase() + selectedRoleForLogin.slice(1)} Role` :
              (existingUser && showLoginForm ? t.signup.welcomeBack : t.signup.createAccount)}
          </Text>
          <Text style={styles.subtitle}>
            {selectedRoleForLogin && !showLoginForm ?
              `Complete your ${selectedRoleForLogin} profile to add this role to your account` :
              (existingUser && showLoginForm
                ? t.signup.loginToContinue
                : existingUser
                  ? t.signup.accountExistsMessage || "An account with this email already exists."
                  : t.signup.joinHustleX)}
          </Text>

          {/* Email Input - Always visible */}
          <View style={{ position: 'relative' }}>
            <TextInput
              ref={emailInputRef}
              style={styles.input}
              placeholder={t.signup.email}
              placeholderTextColor={darkMode ? '#9ca3af' : '#6b7280'}
              value={email}
              onChangeText={handleEmailChange}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!showLoginForm && !selectedRoleForLogin} /* Disable editing when adding a role */
            />
            {checkingUser && (
              <View style={styles.checkingIndicator}>
                <ActivityIndicator size="small" color="#06b6d4" />
              </View>
            )}
          </View>

          {/* Login Form for Existing Users */}
          {existingUser && showLoginForm && (
            <Animated.View entering={FadeIn} exiting={FadeOut}>
              <View style={styles.accountSelectionContainer}>
                <Text style={styles.accountSelectionTitle}>Sign In</Text>
                <Text style={styles.accountSelectionSubtitle}>
                  {selectedRoleForLogin && !existingUser.roles?.includes(selectedRoleForLogin)
                    ? `Sign in to add ${selectedRoleForLogin} role to your account`
                    : `Sign in to continue as ${selectedRoleForLogin || existingUser.roles?.[0] || 'user'}`}
                </Text>

                <TextInput
                  style={[styles.input, { opacity: 0.6 }]}
                  value={email}
                  editable={false}
                  placeholderTextColor={darkMode ? '#9ca3af' : '#6b7280'}
                />
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Password"
                    placeholderTextColor={darkMode ? '#9ca3af' : '#6b7280'}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off" : "eye"}
                      size={20}
                      color={darkMode ? '#9ca3af' : '#6b7280'}
                    />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword' as never)}>
                  <Text style={styles.linkText}>{t.signup.forgotPassword}</Text>
                </TouchableOpacity>

                {error && (
                  <Animated.View entering={FadeIn} exiting={FadeOut}>
                    <Text style={styles.errorText}>{error}</Text>
                  </Animated.View>
                )}

                <TouchableOpacity
                  style={[styles.button, isLoading && styles.buttonDisabled]}
                  onPress={handleLogin}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.buttonText}>Sign In</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => {
                    setShowLoginForm(false);
                    setSelectedRoleForLogin(null);
                    setPassword("");
                    setError(null);
                  }}
                >
                  <Text style={styles.backButtonText}>Back to Account Selection</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}

          {/* Existing Accounts Selection */}
          {existingUser && !showLoginForm && (
            <Animated.View entering={FadeIn} exiting={FadeOut}>
              <View style={styles.accountSelectionContainer}>
                <Text style={styles.accountSelectionTitle}>
                  {t.signup.accountFound || "Account Found"}
                </Text>
                <Text style={styles.accountSelectionSubtitle}>
                  {t.signup.accountExistsMessage || "An account with this email already exists. Please sign in or add a new role."}
                </Text>

                {/* Existing Roles */}
                {existingUser.roles && (
                  <View style={{ marginBottom: 16 }}>
                    <Text style={styles.addRoleTitle}>
                      {email.toLowerCase().replace(/\s/g, "") === "hustlexet@gmail.com"
                        ? "Admin Account Found:"
                        : "Continue with existing role:"}
                    </Text>
                    {email.toLowerCase().replace(/\s/g, "") === "hustlexet@gmail.com" ? (
                      <TouchableOpacity
                        onPress={() => handleAccountSelection("admin")}
                        disabled={isLoading}
                        style={[
                          styles.existingRoleButton,
                          styles.existingRoleButtonAdmin,
                        ]}
                      >
                        <View style={styles.roleButtonContent}>
                          <Ionicons
                            name="shield-checkmark"
                            size={20}
                            color={darkMode ? "#a78bfa" : "#7c3aed"}
                          />
                          <Text
                            style={[
                              styles.existingRoleButtonText,
                              styles.roleButtonTextAdmin,
                            ]}
                          >
                            Admin Account
                            {existingUser.profile?.firstName &&
                              ` (${existingUser.profile.firstName} ${existingUser.profile.lastName})`}
                          </Text>
                        </View>
                        <Ionicons
                          name="chevron-forward"
                          size={20}
                          color={darkMode ? "#9ca3af" : "#6b7280"}
                        />
                      </TouchableOpacity>
                    ) : (
                      existingUser.roles.length > 0 &&
                      existingUser.roles.map((userRole: string) => (
                        <TouchableOpacity
                          key={userRole}
                          onPress={() => handleAccountSelection(userRole)}
                          disabled={isLoading}
                          style={[
                            styles.existingRoleButton,
                            userRole === "freelancer"
                              ? styles.existingRoleButtonFreelancer
                              : styles.existingRoleButtonClient,
                          ]}
                        >
                          <View style={styles.roleButtonContent}>
                            <Ionicons
                              name={
                                userRole === "freelancer"
                                  ? "briefcase"
                                  : "business"
                              }
                              size={20}
                              color={
                                userRole === "freelancer"
                                  ? darkMode
                                    ? "#06b6d4"
                                    : "#0891b2"
                                  : darkMode
                                    ? "#22c55e"
                                    : "#16a34a"
                              }
                            />
                            <Text
                              style={[
                                styles.existingRoleButtonText,
                                userRole === "freelancer"
                                  ? styles.roleButtonTextFreelancer
                                  : styles.roleButtonTextClient,
                              ]}
                            >
                              {userRole.charAt(0).toUpperCase() +
                                userRole.slice(1)}{" "}
                              Account
                              {existingUser.profile?.firstName &&
                                ` (${existingUser.profile.firstName} ${existingUser.profile.lastName})`}
                            </Text>
                          </View>
                          <Ionicons
                            name="chevron-forward"
                            size={20}
                            color={darkMode ? "#9ca3af" : "#6b7280"}
                          />
                        </TouchableOpacity>
                      ))
                    )}
                  </View>
                )}

                {/* Add New Role Option */}
                {email.toLowerCase().replace(/\s/g, "") !== "hustlexet@gmail.com" && (
                  <>
                    <View style={styles.divider} />
                    <View style={styles.addRoleSection}>
                      <Text style={styles.addRoleTitle}>
                        Or add a new role to your account:
                      </Text>
                      {!existingUser.roles?.includes("freelancer") && (
                        <TouchableOpacity
                          onPress={() => handleAddRole("freelancer")}
                          disabled={isLoading}
                          style={[
                            styles.existingRoleButton,
                            styles.existingRoleButtonFreelancer,
                          ]}
                        >
                          <View style={styles.roleButtonContent}>
                            <Ionicons
                              name="briefcase"
                              size={20}
                              color={darkMode ? "#06b6d4" : "#0891b2"}
                            />
                            <Text style={styles.roleButtonTextFreelancer}>
                              {t.signup.addFreelancerRole ||
                                "Add Freelancer Role"}{" "}
                              - Offer Services
                            </Text>
                          </View>
                          <Ionicons
                            name="add-circle"
                            size={20}
                            color={darkMode ? "#06b6d4" : "#0891b2"}
                          />
                        </TouchableOpacity>
                      )}
                      {!existingUser.roles?.includes("client") && (
                        <TouchableOpacity
                          onPress={() => handleAddRole("client")}
                          disabled={isLoading}
                          style={[
                            styles.existingRoleButton,
                            styles.existingRoleButtonClient,
                          ]}
                        >
                          <View style={styles.roleButtonContent}>
                            <Ionicons
                              name="business"
                              size={20}
                              color={darkMode ? "#22c55e" : "#16a34a"}
                            />
                            <Text style={styles.roleButtonTextClient}>
                              {t.signup.addClientRole || "Add Client Role"} -
                              Hire Freelancers
                            </Text>
                          </View>
                          <Ionicons
                            name="add-circle"
                            size={20}
                            color={darkMode ? "#22c55e" : "#16a34a"}
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                  </>
                )}
              </View>
            </Animated.View>
          )}

          {/* Create Account Form */}
          {!existingUser || (selectedRoleForLogin && !showLoginForm) ? (
            <>
              {/* Name fields - always visible */}
              {selectedRoleForLogin && (
                <View style={{ marginBottom: 16 }}>
                  <Text style={[
                    styles.subtitle,
                    { textAlign: 'left', fontSize: 14, color: darkMode ? '#9ca3af' : '#6b7280' }
                  ]}>
                    Adding {selectedRoleForLogin} role to account: {email}
                  </Text>
                </View>
              )}
              <View style={styles.inputRow}>
                <View style={styles.inputHalf}>
                  <TextInput
                    style={styles.input}
                    placeholder="First Name"
                    placeholderTextColor={darkMode ? '#9ca3af' : '#6b7280'}
                    value={firstName}
                    onChangeText={setFirstName}
                    autoCapitalize="words"
                  />
                </View>
                <View style={styles.inputHalf}>
                  <TextInput
                    style={styles.input}
                    placeholder={t.signup.lastName}
                    placeholderTextColor={darkMode ? '#9ca3af' : '#6b7280'}
                    value={lastName}
                    onChangeText={setLastName}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              {/* Password fields - needed for authentication when adding a role */}
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder={selectedRoleForLogin ? "Enter your existing password" : "Password"}
                  placeholderTextColor={darkMode ? '#9ca3af' : '#6b7280'}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color={darkMode ? '#9ca3af' : '#6b7280'}
                  />
                </TouchableOpacity>
              </View>

              {/* Confirm password field - only shown when creating new account */}
              {!selectedRoleForLogin && (
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder={t.signup.confirmPassword || "Confirm Password"}
                    placeholderTextColor={darkMode ? '#9ca3af' : '#6b7280'}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Ionicons
                      name={showConfirmPassword ? "eye-off" : "eye"}
                      size={20}
                      color={darkMode ? '#9ca3af' : '#6b7280'}
                    />
                  </TouchableOpacity>
                </View>
              )}

              {/* Role selector - hide when adding a specific role */}
              {!selectedRoleForLogin && (
                <View style={{ marginBottom: 24 }}>
                  {email.toLowerCase().replace(/\s/g, "") ===
                    "hustlexet@gmail.com" ? (
                    <View
                      style={[
                        styles.accountSelectionContainer,
                        {
                          borderColor: darkMode
                            ? "rgba(139, 92, 246, 0.4)"
                            : "rgba(139, 92, 246, 0.2)",
                          backgroundColor: darkMode
                            ? "rgba(139, 92, 246, 0.1)"
                            : "rgba(139, 92, 246, 0.05)",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.accountSelectionTitle,
                          { color: darkMode ? "#a78bfa" : "#7c3aed" },
                        ]}
                      >
                        Admin Registration
                      </Text>
                      <Text style={styles.accountSelectionSubtitle}>
                        This email is reserved for administrative access.
                      </Text>
                    </View>
                  ) : (
                    <>
                      <Text
                        style={[
                          styles.subtitle,
                          { marginBottom: 12, textAlign: "left" },
                        ]}
                      >
                        {t.signup.iWantTo || "I want to:"}
                      </Text>
                      <View style={styles.roleSelector}>
                        <TouchableOpacity
                          style={[
                            styles.roleButton,
                            role === "freelancer" && styles.roleButtonActive,
                          ]}
                          onPress={() => setRole("freelancer")}
                        >
                          <Text
                            style={[
                              styles.roleButtonText,
                              role === "freelancer" &&
                              styles.roleButtonTextActive,
                            ]}
                          >
                            Find Work
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.roleButton,
                            role === "client" && styles.roleButtonActive,
                          ]}
                          onPress={() => setRole("client")}
                        >
                          <Text
                            style={[
                              styles.roleButtonText,
                              role === "client" && styles.roleButtonTextActive,
                            ]}
                          >
                            {t.signup.hireFreelancers || "Hire Freelancers"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                </View>
              )}

              {error && (
                <Animated.View entering={FadeIn} exiting={FadeOut}>
                  <Text style={styles.errorText}>{error}</Text>
                </Animated.View>
              )}

              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.buttonText}>
                    {selectedRoleForLogin ? `Add ${selectedRoleForLogin} Role` : 'Create Account'}
                  </Text>
                )}
              </TouchableOpacity>


            </>
          ) : (
            <>
              {existingUser && (
                <>
                  <TouchableOpacity onPress={() => emailInputRef.current?.focus()}>
                    <Text style={styles.linkText}>{t.signup.alreadyHaveAccount} {t.signup.signIn}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword' as never)}>
                    <Text style={styles.linkText}>{t.signup.forgotPassword}</Text>
                  </TouchableOpacity>
                </>
              )}
            </>
          )}

          {!existingUser && (
            <>
              <TouchableOpacity onPress={() => emailInputRef.current?.focus()}>
                <Text style={styles.linkText}>{t.signup.alreadyHaveAccount} {t.signup.signIn}</Text>
              </TouchableOpacity>
              {(selectedRoleForLogin || !existingUser) && (
                <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword' as never)}>
                  <Text style={styles.linkText}>{t.signup.forgotPassword}</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Signup;
