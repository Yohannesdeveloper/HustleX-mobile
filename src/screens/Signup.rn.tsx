/**
 * React Native Signup/Login Screen
 * Complete conversion maintaining exact UI/UX
 */

import React, { useState, useRef } from "react";
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
  const { register, login, addRole, switchRole } = useAuth();
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const t = useTranslation();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"freelancer" | "client">("freelancer");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [existingUser, setExistingUser] = useState<any>(null);
  const [checkingUser, setCheckingUser] = useState(false);
  const [selectedRoleForLogin, setSelectedRoleForLogin] = useState<string | null>(null);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const emailCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      // Only check if email is valid
      if (text.includes('@') && text.length > 5) {
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
    setShowLoginForm(true);
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
      if (targetRole === 'freelancer') {
        // Always navigate to freelancer dashboard when freelancer role is selected
        console.log('Navigating to FreelancingDashboard for freelancer role');
        navigation.reset({
          index: 0,
          routes: [{ name: 'FreelancingDashboard' as never }],
        });
      } else if (targetRole === 'client') {
        const hasClientProfile = loggedInUser?.hasCompanyProfile;
        
        if (hasClientProfile) {
          navigation.reset({
            index: 0,
            routes: [{ name: 'HiringDashboard' as never }],
          });
        } else {
          navigation.navigate('CompanyProfile' as never);
        }
      } else {
        navigation.navigate(redirectPath as never);
      }
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

    // Prevent registration if user already exists
    if (existingUser) {
      setError("An account with this email already exists. Please choose from existing accounts above.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Strong password validation
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      setError("Password must be at least 8 characters long and contain at least one letter and one number");
      return;
    }

    if (!firstName || !lastName) {
      setError("Please enter your first and last name.");
      return;
    }

    setIsLoading(true);
    try {
      await register({
        email,
        password,
        role,
        firstName,
        lastName,
      });

      console.log("Registration successful");
      // Redirect to appropriate wizard based on role
      if (role === 'freelancer') {
        navigation.navigate('FreelancerProfileSetup' as never);
      } else if (role === 'client') {
        navigation.navigate('CompanyProfile' as never);
      } else {
        navigation.navigate(redirectPath as never);
      }
    } catch (err: any) {
      let errorMessage = "Failed to create account. Please try again.";
      
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
      }
      
      setError(errorMessage);
      console.error('Registration error:', err);
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
      flex: 1,
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
          textOverflow: 'ellipsis',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
        },
      }),
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
      backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
      borderRadius: 12,
      padding: 4,
    },
    roleButton: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
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
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.title}>
            {existingUser && showLoginForm ? t.signup.welcomeBack : t.signup.createAccount}
          </Text>
          <Text style={styles.subtitle}>
            {existingUser && showLoginForm 
              ? t.signup.loginToContinue 
              : existingUser
              ? t.signup.accountExistsMessage || "An account with this email already exists."
              : t.signup.joinHustleX}
          </Text>

          {/* Email Input - Always visible */}
          <View style={{ position: 'relative' }}>
            <TextInput
              style={styles.input}
              placeholder={t.signup.email}
              placeholderTextColor={darkMode ? '#9ca3af' : '#6b7280'}
              value={email}
              onChangeText={handleEmailChange}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!showLoginForm}
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
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor={darkMode ? '#9ca3af' : '#6b7280'}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
                
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
                {existingUser.roles && existingUser.roles.length > 0 && (
                  <View style={{ marginBottom: 16 }}>
                    <Text style={styles.addRoleTitle}>Continue with existing role:</Text>
                    {existingUser.roles.map((userRole: string) => (
                      <TouchableOpacity
                        key={userRole}
                        onPress={() => handleAccountSelection(userRole)}
                        disabled={isLoading}
                        style={[
                          styles.existingRoleButton,
                          userRole === 'freelancer' 
                            ? styles.existingRoleButtonFreelancer 
                            : styles.existingRoleButtonClient
                        ]}
                      >
                        <View style={styles.roleButtonContent}>
                          <Ionicons 
                            name={userRole === 'freelancer' ? 'briefcase' : 'business'} 
                            size={20} 
                            color={userRole === 'freelancer' 
                              ? (darkMode ? '#06b6d4' : '#0891b2')
                              : (darkMode ? '#22c55e' : '#16a34a')
                            } 
                          />
                          <Text style={[
                            styles.existingRoleButtonText,
                            userRole === 'freelancer' 
                              ? styles.roleButtonTextFreelancer 
                              : styles.roleButtonTextClient
                          ]}>
                            {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Account
                            {existingUser.profile?.firstName && ` (${existingUser.profile.firstName} ${existingUser.profile.lastName})`}
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={darkMode ? '#9ca3af' : '#6b7280'} />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Add New Role Option */}
                <View style={styles.divider} />
                <View style={styles.addRoleSection}>
                  <Text style={styles.addRoleTitle}>Or add a new role to your account:</Text>
                  {!existingUser.roles?.includes('freelancer') && (
                    <TouchableOpacity
                      onPress={() => handleAddRole('freelancer')}
                      disabled={isLoading}
                      style={[styles.existingRoleButton, styles.existingRoleButtonFreelancer]}
                    >
                      <View style={styles.roleButtonContent}>
                        <Ionicons name="briefcase" size={20} color={darkMode ? '#06b6d4' : '#0891b2'} />
                        <Text style={styles.roleButtonTextFreelancer}>
                          {t.signup.addFreelancerRole || "Add Freelancer Role"} - Offer Services
                        </Text>
                      </View>
                      <Ionicons name="add-circle" size={20} color={darkMode ? '#06b6d4' : '#0891b2'} />
                    </TouchableOpacity>
                  )}
                  {!existingUser.roles?.includes('client') && (
                    <TouchableOpacity
                      onPress={() => handleAddRole('client')}
                      disabled={isLoading}
                      style={[styles.existingRoleButton, styles.existingRoleButtonClient]}
                    >
                      <View style={styles.roleButtonContent}>
                        <Ionicons name="business" size={20} color={darkMode ? '#22c55e' : '#16a34a'} />
                        <Text style={styles.roleButtonTextClient}>
                          {t.signup.addClientRole || "Add Client Role"} - Hire Freelancers
                        </Text>
                      </View>
                      <Ionicons name="add-circle" size={20} color={darkMode ? '#22c55e' : '#16a34a'} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </Animated.View>
          )}

          {/* Create Account Form */}
          {!existingUser && (
            <>
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

              <View style={styles.inputRow}>
                <View style={styles.inputHalf}>
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor={darkMode ? '#9ca3af' : '#6b7280'}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                </View>
                <View style={styles.inputHalf}>
                  <TextInput
                    style={[styles.input, Platform.OS === 'web' && styles.inputSmall]}
                    placeholder={t.signup.confirmPassword || "Confirm"}
                    placeholderTextColor={darkMode ? '#9ca3af' : '#6b7280'}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                  />
                </View>
              </View>

              <View style={{ marginBottom: 24 }}>
                <Text style={[styles.subtitle, { marginBottom: 12, textAlign: 'left' }]}>
                  {t.signup.iWantTo || "I want to:"}
                </Text>
                <View style={styles.roleSelector}>
                  <TouchableOpacity
                    style={[styles.roleButton, role === 'freelancer' && styles.roleButtonActive]}
                    onPress={() => setRole('freelancer')}
                  >
                    <Text style={[styles.roleButtonText, role === 'freelancer' && styles.roleButtonTextActive]}>
                      Find Work
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.roleButton, role === 'client' && styles.roleButtonActive]}
                    onPress={() => setRole('client')}
                  >
                    <Text style={[styles.roleButtonText, role === 'client' && styles.roleButtonTextActive]}>
                      {t.signup.hireFreelancers || "Hire Freelancers"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

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
                  <Text style={styles.buttonText}>Create Account</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {!existingUser && (
            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword' as never)}>
              <Text style={styles.linkText}>{t.signup.forgotPassword}</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Signup;
