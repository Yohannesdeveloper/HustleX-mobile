/**
 * React Native Version of HomeNavbar
 * This is a complete conversion example showing the pattern
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Platform,
  Modal,
  ScrollView,
  Pressable
} from "react-native";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { store } from "../store/index-react-native";
import { toggleTheme } from "../store/themeSlice";
import { setLanguage, type Language } from "../store/languageSlice";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../store/hooks";
import { useTranslation } from "../hooks/useTranslation";
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  useSharedValue 
} from "react-native-reanimated";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const HomeNavbar: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const language = useAppSelector((s) => s.language.language);
  const { user, isAuthenticated } = useAuth();
  const t = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const languageMenuRef = useRef<View>(null);

  const userRole = user?.role || "guest";

  // Close language menu when clicking outside (for web)
  useEffect(() => {
    if (!languageMenuOpen || Platform.OS !== 'web') return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target) return;
      
      // Check if click is on the language button or menu
      const isLanguageButton = target.closest('[data-language-button]');
      const isLanguageMenu = target.closest('[data-language-menu]');
      
      // Also check if click is inside the language menu container
      const languageContainer = languageMenuRef.current;
      if (languageContainer && Platform.OS === 'web') {
        const containerElement = (languageContainer as any)._nativeNode || languageContainer;
        if (containerElement && containerElement.contains && containerElement.contains(target)) {
          return; // Click is inside container, don't close
        }
      }
      
      if (!isLanguageButton && !isLanguageMenu) {
        console.log('Click outside language menu, closing');
        setLanguageMenuOpen(false);
      }
    };

    // Add event listener after a small delay to avoid immediate closure
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 200); // Increased delay to allow menu clicks to register

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [languageMenuOpen]);

  const languages: { code: Language; name: string; nativeName: string }[] = [
    { code: "en", name: "English", nativeName: "English" },
    { code: "am", name: "Amharic", nativeName: "አማርኛ" },
    { code: "ti", name: "Tigrinya", nativeName: "ትግርኛ" },
    { code: "om", name: "Afan Oromo", nativeName: "Afaan Oromoo" },
  ];

  // Recalculate current language when language state changes
  const currentLanguage = React.useMemo(() => {
    const found = languages.find((lang) => lang.code === language);
    console.log('Current language from Redux:', language, 'Found:', found);
    return found || languages[0];
  }, [language]);

  // Debug: Log when language changes
  useEffect(() => {
    console.log('Language state changed in HomeNavbar:', language);
  }, [language]);

  const toggleDarkMode = () => {
    dispatch(toggleTheme());
  };

  const handleLanguageChange = (lang: Language) => {
    console.log('=== Language Change Start ===');
    console.log('Changing language to:', lang);
    console.log('Current language before change:', language);
    
    // Prevent selecting the same language
    if (lang === language) {
      console.log('Language already selected, closing menu');
      setLanguageMenuOpen(false);
      return;
    }
    
    try {
      // Update Redux state - this should trigger re-render via useTranslation hook
      dispatch(setLanguage(lang));
      console.log('Language dispatch completed for:', lang);
      
      // Verify the state was updated
      setTimeout(() => {
        const newState = store.getState();
        console.log('Redux state after dispatch:', newState.language.language);
        console.log('Expected:', lang, 'Actual:', newState.language.language);
      }, 50);
      
      // Close menu after a small delay to ensure state update
      setTimeout(() => {
        setLanguageMenuOpen(false);
        console.log('Menu closed, new language should be:', lang);
        console.log('=== Language Change End ===');
      }, 150);
    } catch (error) {
      console.error('Error in handleLanguageChange:', error);
    }
  };

  const navigate = (route: string) => {
    navigation.navigate(route as never);
    setMenuOpen(false);
  };

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const styles = StyleSheet.create({
    container: {
      width: '100%',
      backgroundColor: darkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
      borderBottomWidth: 1,
      borderBottomColor: darkMode ? 'rgba(6, 182, 212, 0.2)' : 'rgba(6, 182, 212, 0.1)',
      paddingVertical: 8,
      paddingHorizontal: 16,
      ...Platform.select({
        web: {
          zIndex: 100,
          overflow: 'visible',
        },
      }),
    },
    content: {
      maxWidth: 1280,
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      alignSelf: 'center',
      ...Platform.select({
        web: {
          position: 'relative',
          overflow: 'visible',
          display: 'flex',
          flexWrap: 'nowrap',
        },
      }),
    },
    logo: {
      fontSize: Math.max(Platform.OS === 'web' ? 24 : 20, 14), // Ensure minimum fontSize
      fontWeight: '800',
      letterSpacing: Platform.OS === 'android' ? 0 : -0.5, // Android has issues with negative letterSpacing
      flexDirection: 'row',
      alignItems: 'center',
      flexShrink: 0,
      ...Platform.select({
        web: {
          minWidth: 'auto',
          marginRight: 16,
        },
      }),
    },
    logoText: {
      color: darkMode ? '#ffffff' : '#000000',
    },
    logoX: {
      color: '#06b6d4',
    },
    navLinks: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flex: 1,
      justifyContent: 'center',
      flexShrink: 1,
      ...Platform.select({
        web: {
          overflow: 'visible',
          display: 'flex',
          visibility: 'visible',
          opacity: 1,
          minWidth: 400,
        },
      }),
    },
    navLink: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 20,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      flexShrink: 0,
      ...Platform.select({
        web: {
          whiteSpace: 'nowrap',
        },
      }),
    },
    navLinkText: {
      fontSize: 12,
      color: darkMode ? '#ffffff' : '#000000',
    },
    rightSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flexShrink: 0,
      ...Platform.select({
        web: {
          zIndex: 100,
          minWidth: 'auto',
          marginLeft: 16,
        },
      }),
    },
    iconButton: {
      padding: 8,
      borderRadius: 8,
    },
    menuButton: {
      padding: 8,
    },
    mobileMenu: {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      backgroundColor: darkMode ? '#000000' : '#ffffff',
      borderTopWidth: 1,
      borderTopColor: darkMode ? 'rgba(6, 182, 212, 0.2)' : 'rgba(6, 182, 212, 0.1)',
      padding: 16,
      zIndex: 1000,
    },
    menuItem: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    },
    menuItemText: {
      fontSize: 16,
      color: darkMode ? '#ffffff' : '#000000',
    },
    languageContainer: {
      position: 'relative',
      ...Platform.select({
        web: {
          zIndex: 10000,
          display: 'flex',
        },
        default: {
          zIndex: 1000,
        },
      }),
    },
    languageMenu: {
      position: 'absolute',
      top: '100%',
      right: 0,
      marginTop: 8,
      backgroundColor: darkMode ? '#1a1a1a' : '#ffffff',
      borderRadius: 8,
      padding: 8,
      minWidth: 150,
      borderWidth: Platform.OS === 'web' ? 1 : 0,
      borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      ...Platform.select({
        web: {
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
          zIndex: 10001,
          overflow: 'visible',
          display: 'flex',
          flexDirection: 'column',
          position: 'absolute',
        },
        default: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 10,
          zIndex: 1001,
        },
      }),
    },
    languageOption: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 4,
    },
    languageOptionText: {
      fontSize: 14,
      color: darkMode ? '#ffffff' : '#000000',
    },
    activeLanguage: {
      backgroundColor: darkMode ? 'rgba(6, 182, 212, 0.2)' : 'rgba(6, 182, 212, 0.1)',
    },
    authButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      marginLeft: 8,
    },
    loginButton: {
      backgroundColor: '#06b6d4',
    },
    signupButton: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: '#06b6d4',
    },
    authButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#ffffff',
    },
    signupButtonText: {
      color: '#06b6d4',
    },
  });

  // Recreate navLinks when language changes to ensure translations update
  const navLinks = React.useMemo(() => [
    { to: "HomeFinal", label: t.nav.home },
    { to: "AboutUs", label: t.nav.aboutUs },
    { to: "HowItWorks", label: t.nav.howItWorks },
    { to: "JobListings", label: t.nav.exploreJobs },
    { to: "Pricing", label: t.nav.pricing },
    { to: "Blog", label: t.nav.blog },
    { to: "FAQ", label: t.nav.faq },
    { to: "ContactUs", label: t.nav.contact },
  ], [t, language]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <AnimatedTouchable
          style={[styles.logo, animatedStyle]}
          onPress={() => navigate("HomeFinal")}
          onPressIn={() => {
            scale.value = withSpring(1.05);
          }}
          onPressOut={() => {
            scale.value = withSpring(1);
          }}
        >
          <Text style={styles.logoText}>Hustle</Text>
          <Text style={styles.logoX}>X</Text>
        </AnimatedTouchable>

        {/* Desktop Nav Links */}
        {Platform.OS === 'web' && (
          <View style={styles.navLinks}>
            {navLinks.map((link) => (
              <TouchableOpacity
                key={link.to}
                style={styles.navLink}
                onPress={() => navigate(link.to)}
              >
                <Text style={styles.navLinkText}>{link.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Right Section */}
        <View style={styles.rightSection}>
          {/* Language Switcher */}
          <View style={styles.languageContainer} ref={languageMenuRef}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setLanguageMenuOpen(!languageMenuOpen)}
              {...(Platform.OS === 'web' && { 'data-language-button': true } as any)}
            >
              <Ionicons 
                name="language" 
                size={20} 
                color={darkMode ? '#ffffff' : '#000000'} 
              />
            </TouchableOpacity>
            {languageMenuOpen && (
              <View 
                style={styles.languageMenu}
                {...(Platform.OS === 'web' && { 'data-language-menu': true } as any)}
              >
                {languages.map((lang) => {
                  const isActive = currentLanguage.code === lang.code;
                  return (
                    <TouchableOpacity
                      key={lang.code}
                      style={[
                        styles.languageOption,
                        isActive && styles.activeLanguage
                      ]}
                      onPress={() => {
                        console.log('=== Language Option Clicked ===');
                        console.log('Selected language:', lang.code);
                        console.log('Current language:', language);
                        console.log('Is active:', isActive);
                        
                        if (lang.code !== language) {
                          console.log('Calling handleLanguageChange with:', lang.code);
                          handleLanguageChange(lang.code);
                        } else {
                          console.log('Same language selected, just closing menu');
                          setLanguageMenuOpen(false);
                        }
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.languageOptionText}>
                        {lang.nativeName}
                        {isActive && ' ✓'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          {/* Dark Mode Toggle */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={toggleDarkMode}
          >
            <Ionicons
              name={darkMode ? "sunny" : "moon"}
              size={20}
              color={darkMode ? '#ffffff' : '#000000'}
            />
          </TouchableOpacity>

          {/* Desktop Login/Signup Buttons */}
          {Platform.OS === 'web' && !isAuthenticated && (
            <>
              <TouchableOpacity
                style={[styles.authButton, styles.loginButton]}
                onPress={() => navigate("Login")}
              >
                <Text style={styles.authButtonText}>{t.nav.logIn}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.authButton, styles.signupButton]}
                onPress={() => navigate("Signup")}
              >
                <Text style={[styles.authButtonText, styles.signupButtonText]}>
                  {t.nav.signUp}
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* Mobile Menu Button */}
          {Platform.OS !== 'web' && (
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => setMenuOpen(!menuOpen)}
            >
              <Ionicons
                name={menuOpen ? "close" : "menu"}
                size={24}
                color={darkMode ? '#ffffff' : '#000000'}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Mobile Menu */}
      {menuOpen && Platform.OS !== 'web' && (
        <ScrollView style={styles.mobileMenu}>
          {navLinks.map((link) => (
            <TouchableOpacity
              key={link.to}
              style={styles.menuItem}
              onPress={() => navigate(link.to)}
            >
              <Text style={styles.menuItemText}>{link.label}</Text>
            </TouchableOpacity>
          ))}
          {isAuthenticated ? (
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigate(userRole === "client" ? "HiringDashboard" : "FreelancingDashboard")}
            >
              <Text style={styles.menuItemText}>Dashboard</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigate("Signup")}
              >
                <Text style={styles.menuItemText}>{t.nav.signUp}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigate("Login")}
              >
                <Text style={styles.menuItemText}>{t.nav.logIn}</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default HomeNavbar;
