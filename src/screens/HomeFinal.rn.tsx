/**
 * React Native HomeFinal Screen
 * Landing page with hero section, stats, features, and CTA
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { toggleTheme } from '../store/themeSlice';
import HomeNavbar from '../components/HomeNavbar.rn';
import { useTranslation } from '../hooks/useTranslation';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const width = Math.max(screenWidth || 375, 375); // Ensure minimum width
const height = Math.max(screenHeight || 667, 667); // Ensure minimum height

const HomeFinal: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const language = useAppSelector((s) => s.language.language);
  const t = useTranslation();
  const [userRole, setUserRole] = useState<'freelancer' | 'client' | 'guest'>('guest');

  // Company logos from assets/logos folder - using require() for bundled assets
  const companyLogos = [
    { name: 'AAU', source: require('../assets/logos/AAU.png') },
    { name: 'Airlines', source: require('../assets/logos/Airlines.png') },
    { name: 'Company1', source: require('../assets/logos/company1.png') },
    { name: 'ETC', source: require('../assets/logos/etc.png') },
    { name: 'Gift', source: require('../assets/logos/gift.png') },
    { name: 'Logo', source: require('../assets/logos/Logo.png') },
  ];
  
  // Marquee animation for logos
  const marqueeTranslateX = useSharedValue(0);
  
  useEffect(() => {
    // Duplicate logos for seamless loop
    // Logo container width (100) + gap (64) = 164px per logo
    const logoWidth = 164; // Width per logo including gap
    const singleSetWidth = companyLogos.length * logoWidth;
    
    // Initialize to 0
    marqueeTranslateX.value = 0;
    
    // Continuous infinite scroll from right to left
    // Animation moves one full set width, then resets to 0 seamlessly
    // The duplicate sets ensure continuity when reset happens
    marqueeTranslateX.value = withRepeat(
      withTiming(-singleSetWidth, { 
        duration: 20000, 
        easing: Easing.linear 
      }),
      -1,
      false // false = reset to start (no reverse), creating seamless infinite loop
    );
  }, [companyLogos.length]);

  const marqueeAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: marqueeTranslateX.value }],
    };
  });

  const stats = [
    { number: '10K+', label: t.categories.eliteFreelancers, icon: 'people' },
    { number: '5K+', label: 'Happy Clients', icon: 'heart' },
    { number: '20M+', label: 'Success Projects', icon: 'rocket' },
    { number: '98%', label: 'Success Rate', icon: 'star' },
  ];

  const categories = [
    { title: t.categories.development, icon: 'code', count: '1,200+', color: '#3b82f6' },
    { title: t.categories.design, icon: 'brush', count: '800+', color: '#a855f7' },
    { title: t.categories.marketing, icon: 'megaphone', count: '650+', color: '#ef4444' },
    { title: t.categories.mobile, icon: 'phone-portrait', count: '450+', color: '#10b981' },
    { title: t.categories.writing, icon: 'mail', count: '1,000+', color: '#f59e0b' },
    { title: t.categories.translation, icon: 'chatbubbles', count: '300+', color: '#06b6d4' },
    { title: t.categories.business, icon: 'briefcase', count: '900+', color: '#6b7280' },
    { title: t.categories.consulting, icon: 'person', count: '700+', color: '#6366f1' },
  ];

  const featuredFreelancers = [
    {
      name: 'Yohannes',
      title: 'Full Stack Developer',
      skills: ['React', 'Node.js', 'TypeScript'],
      rate: '$28/hr',
      image: require('../Images/Freelancers/Yohannes.png'),
    },
    {
      name: 'Samuel T.',
      title: 'Full Stack Developer',
      skills: ['React', 'Node.js', 'Tailwind CSS'],
      rate: '$25/hr',
      image: require('../Images/Freelancers/Samuel.png'),
    },
    {
      name: 'Messi',
      title: 'Mobile Developer',
      skills: ['Flutter', 'React Native', 'iOS'],
      rate: '$30/hr',
      image: require('../Images/Freelancers/messie.png'),
    },
    {
      name: 'Lily M.',
      title: 'UI/UX Designer',
      skills: ['Figma', 'Adobe XD', 'Sketch'],
      rate: '$30/hr',
      image: null,
    },
  ];

  const testimonials = [
    {
      quote: "HustleX transformed our hiring process. We found the perfect developer in just 3 days!",
      name: 'Mesfin T.',
      role: 'CTO, TechEthiopia',
      image: require('../Images/testimonials/Messay.jpg'),
    },
    {
      quote: "As a freelancer, I've been able to triple my income while working on projects I'm passionate about.",
      name: 'Bethelhem A.',
      role: 'UI/UX Designer',
      image: require('../Images/Freelancers/messie.png'),
    },
    {
      quote: 'The payment protection gives me confidence to hire freelancers without worry.',
      name: 'Yodit K.',
      role: 'Marketing Director',
      image: require('../Images/Freelancers/Yohannes.png'),
    },
  ];

  return (
    <View style={[styles.container, darkMode && styles.containerDark]}>
      {/* Navigation Bar */}
      <HomeNavbar />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={[styles.heroSection, darkMode && styles.heroSectionDark]}>
          <Animated.View
            entering={FadeInDown.duration(800).delay(300)}
            style={styles.heroContent}
          >
            <View style={styles.heroTextContainer}>
              <View style={styles.heroTitleWrapper}>
                <Text 
                  style={[styles.heroTitle, darkMode && styles.heroTitleDark]}
                  numberOfLines={0}
                  allowFontScaling={true}
                >
                  {t.hero.title}
                </Text>
                <Text 
                  style={[styles.heroTitle, styles.heroTitleAccent]}
                  numberOfLines={0}
                  allowFontScaling={true}
                >
                  {t.hero.titleHighlight}
                </Text>
              </View>
              <Text style={[styles.heroSubtitle, darkMode && styles.heroSubtitleDark]}>
                {t.hero.subtitle}{'\n'}
                <Text style={[styles.heroSubtitleBold, darkMode && styles.heroSubtitleBoldDark]}>{t.hero.subtitleHighlight}</Text>
              </Text>
              <View style={styles.heroButtons}>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => navigation.navigate('Signup' as never)}
                >
                  <Ionicons name="rocket" size={20} color="#fff" />
                  <Text style={styles.primaryButtonText}>{t.hero.getStarted}</Text>
                </TouchableOpacity>
              </View>
            </View>
            {/* Hero Image */}
            <Animated.View
              entering={FadeIn.duration(1000).delay(500)}
              style={styles.heroImageContainer}
            >
              <Image
                source={require('../Images/Herobg.jpg')}
                style={styles.heroImage}
                resizeMode="contain"
              />
            </Animated.View>
          </Animated.View>
        </View>

      {/* Company Logos Section - Marquee */}
      <View style={[styles.logosSection, darkMode && styles.logosSectionDark]}>
        <Text style={[styles.sectionTitle, darkMode && styles.sectionTitleDark]}>
          {t.companies.trustedBy} {t.companies.companies}
        </Text>
        <View style={styles.marqueeContainer}>
          <Animated.View style={[styles.marqueeContent, marqueeAnimatedStyle]}>
            {/* Render multiple sets of logos for seamless infinite scroll */}
            {/* We need at least 2 sets for seamless looping, using 4 sets for smooth continuous scroll */}
            {companyLogos.map((logo, logoIndex) => (
              <View key={`logo-1-${logoIndex}`} style={styles.logoContainer}>
                <Image
                  source={logo.source}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
            ))}
            {companyLogos.map((logo, logoIndex) => (
              <View key={`logo-2-${logoIndex}`} style={styles.logoContainer}>
                <Image
                  source={logo.source}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
            ))}
            {companyLogos.map((logo, logoIndex) => (
              <View key={`logo-3-${logoIndex}`} style={styles.logoContainer}>
                <Image
                  source={logo.source}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
            ))}
            {companyLogos.map((logo, logoIndex) => (
              <View key={`logo-4-${logoIndex}`} style={styles.logoContainer}>
                <Image
                  source={logo.source}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
            ))}
          </Animated.View>
        </View>
      </View>

      {/* Stats Section */}
      <View style={[styles.statsSection, darkMode && styles.statsSectionDark]}>
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <Animated.View
              key={index}
              entering={FadeInUp.duration(600).delay(index * 100)}
              style={[styles.statCard, darkMode && styles.statCardDark]}
            >
              <Ionicons name={stat.icon as any} size={32} color="#06b6d4" />
              <Text style={[styles.statNumber, darkMode && styles.statNumberDark]}>
                {stat.number}
              </Text>
              <Text style={[styles.statLabel, darkMode && styles.statLabelDark]}>
                {stat.label}
              </Text>
            </Animated.View>
          ))}
        </View>
      </View>

      {/* Categories Section */}
      <View style={[styles.categoriesSection, darkMode && styles.categoriesSectionDark]}>
        <Text style={[styles.sectionTitle, darkMode && styles.sectionTitleDark]}>
          {t.categories.popularCategories}
        </Text>
        <View style={styles.categoriesGrid}>
          {categories.map((category, index) => (
            <Animated.View
              key={index}
              entering={FadeInUp.duration(600).delay(index * 50)}
              style={[styles.categoryCard, darkMode && styles.categoryCardDark]}
            >
              <Ionicons name={category.icon as any} size={28} color={category.color} />
              <Text style={[styles.categoryTitle, darkMode && styles.categoryTitleDark]}>
                {category.title}
              </Text>
              <Text style={[styles.categoryCount, { color: category.color }]}>
                {category.count} Freelancers
              </Text>
            </Animated.View>
          ))}
        </View>
      </View>

      {/* Featured Freelancers Section */}
      <View style={[styles.freelancersSection, darkMode && styles.freelancersSectionDark]}>
        <Text style={[styles.sectionTitle, darkMode && styles.sectionTitleDark]}>
          {t.categories.eliteFreelancers}
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.freelancersContainer}
        >
          {featuredFreelancers.map((freelancer, index) => (
            <Animated.View
              key={index}
              entering={FadeInUp.duration(600).delay(index * 100)}
              style={[styles.freelancerCard, darkMode && styles.freelancerCardDark]}
            >
              <View style={styles.freelancerAvatar}>
                {freelancer.image ? (
                  <Image
                    source={freelancer.image}
                    style={styles.freelancerAvatarImage}
                    resizeMode="cover"
                  />
                ) : (
                  <Ionicons name="person" size={40} color="#06b6d4" />
                )}
                <View style={styles.freelancerBadge}>
                  <Ionicons name="star" size={12} color="#fff" />
                </View>
              </View>
              <Text style={[styles.freelancerName, darkMode && styles.freelancerNameDark]}>
                {freelancer.name}
              </Text>
              <Text style={styles.freelancerTitle}>{freelancer.title}</Text>
              <View style={styles.freelancerSkills}>
                {freelancer.skills.map((skill, i) => (
                  <View
                    key={i}
                    style={[
                      styles.skillTag,
                      darkMode && styles.skillTagDark,
                    ]}
                  >
                    <Text
                      style={[
                        styles.skillTagText,
                        darkMode && styles.skillTagTextDark,
                      ]}
                    >
                      {skill}
                    </Text>
                  </View>
                ))}
              </View>
              <Text style={styles.freelancerRate}>{freelancer.rate}</Text>
            </Animated.View>
          ))}
        </ScrollView>
      </View>

      {/* Testimonials Section */}
      <View style={[styles.testimonialsSection, darkMode && styles.testimonialsSectionDark]}>
        <Text style={[styles.sectionTitle, darkMode && styles.sectionTitleDark]}>
          {t.testimonials.title}
        </Text>
        <View style={styles.testimonialsGrid}>
          {testimonials.map((testimonial, index) => (
            <Animated.View
              key={index}
              entering={FadeInUp.duration(600).delay(index * 150)}
              style={[styles.testimonialCard, darkMode && styles.testimonialCardDark]}
            >
              <View style={styles.testimonialIcon}>
                <Text style={styles.testimonialQuoteMark}>"</Text>
              </View>
              <Text style={[styles.testimonialText, darkMode && styles.testimonialTextDark]}>
                {testimonial.quote}
              </Text>
              <View style={styles.testimonialAuthor}>
                <View style={styles.testimonialAvatar}>
                  {testimonial.image ? (
                    <Image 
                      source={testimonial.image} 
                      style={styles.testimonialAvatarImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <Ionicons name="person" size={24} color="#06b6d4" />
                  )}
                </View>
                <View>
                  <Text style={[styles.testimonialName, darkMode && styles.testimonialNameDark]}>
                    {testimonial.name}
                  </Text>
                  <Text style={styles.testimonialRole}>{testimonial.role}</Text>
                </View>
              </View>
            </Animated.View>
          ))}
        </View>
      </View>

      {/* CTA Section */}
      <View style={styles.ctaSection}>
        <Text style={styles.ctaTitle}>{t.cta.title}</Text>
        <Text style={styles.ctaSubtitle}>
          {t.cta.subtitle}{'\n'}
          <Text style={styles.ctaSubtitleBold}>{t.cta.subtitleHighlight}</Text>
        </Text>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => navigation.navigate('JobListings' as never)}
        >
          <Ionicons name="search" size={20} color="#06b6d4" />
          <Text style={styles.ctaButtonText}>{t.cta.findDreamWork}</Text>
        </TouchableOpacity>
      </View>

      {/* Footer Section */}
      <View style={[styles.footer, darkMode && styles.footerDark]}>
        <View style={styles.footerContent}>
          {/* Footer Columns */}
          <View style={styles.footerGrid}>
            {/* For Clients */}
            <View style={styles.footerColumn}>
              <Text style={[styles.footerColumnTitle, darkMode && styles.footerColumnTitleDark]}>
                {t.footer.forClients}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('JobListings' as never)}>
                <Text style={[styles.footerLink, darkMode && styles.footerLinkDark]}>
                  {t.footer.howToHire}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('JobListings' as never)}>
                <Text style={[styles.footerLink, darkMode && styles.footerLinkDark]}>
                  {t.footer.talentMarketplace}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('Pricing' as never)}>
                <Text style={[styles.footerLink, darkMode && styles.footerLinkDark]}>
                  {t.nav.pricing}
                </Text>
              </TouchableOpacity>
            </View>

            {/* For Freelancers */}
            <View style={styles.footerColumn}>
              <Text style={[styles.footerColumnTitle, darkMode && styles.footerColumnTitleDark]}>
                {t.footer.forFreelancers}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('JobListings' as never)}>
                <Text style={[styles.footerLink, darkMode && styles.footerLinkDark]}>
                  {t.footer.howToFindWork}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('JobListings' as never)}>
                <Text style={[styles.footerLink, darkMode && styles.footerLinkDark]}>
                  {t.footer.freelanceJobs}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={[styles.footerLink, darkMode && styles.footerLinkDark]}>
                  {t.footer.resources}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Company */}
            <View style={styles.footerColumn}>
              <Text style={[styles.footerColumnTitle, darkMode && styles.footerColumnTitleDark]}>
                {t.footer.company}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('AboutUs' as never)}>
                <Text style={[styles.footerLink, darkMode && styles.footerLinkDark]}>
                  {t.footer.aboutUs}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={[styles.footerLink, darkMode && styles.footerLinkDark]}>
                  {t.footer.careers}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('ContactUs' as never)}>
                <Text style={[styles.footerLink, darkMode && styles.footerLinkDark]}>
                  {t.footer.contactUs}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Resources */}
            <View style={styles.footerColumn}>
              <Text style={[styles.footerColumnTitle, darkMode && styles.footerColumnTitleDark]}>
                {t.footer.resources}
              </Text>
              <TouchableOpacity>
                <Text style={[styles.footerLink, darkMode && styles.footerLinkDark]}>
                  {t.footer.helpCenter}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('Blog' as never)}>
                <Text style={[styles.footerLink, darkMode && styles.footerLinkDark]}>
                  {t.footer.blog}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={[styles.footerLink, darkMode && styles.footerLinkDark]}>
                  {t.footer.community}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer Bottom */}
          <View style={styles.footerBottom}>
            <View style={styles.footerBottomLeft}>
              <Text style={[styles.footerCopyright, darkMode && styles.footerCopyrightDark]}>
                © 2025 HustleX. {t.footer.allRightsReserved}
              </Text>
              <Text style={[styles.footerMadeWith, darkMode && styles.footerMadeWithDark]}>
                {t.footer.madeWith} <Ionicons name="heart" size={12} color="#ef4444" /> {t.footer.inEthiopia}
              </Text>
            </View>
            <View style={styles.footerSocial}>
              <Text style={[styles.footerFollowUs, darkMode && styles.footerFollowUsDark]}>
                {t.footer.followUs}:
              </Text>
              <View style={styles.socialIcons}>
                <TouchableOpacity style={styles.socialIcon}>
                  <Ionicons name="logo-facebook" size={20} color={darkMode ? '#9ca3af' : '#6b7280'} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialIcon}>
                  <Ionicons name="logo-twitter" size={20} color={darkMode ? '#9ca3af' : '#6b7280'} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialIcon}>
                  <Ionicons name="logo-linkedin" size={20} color={darkMode ? '#9ca3af' : '#6b7280'} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialIcon}>
                  <Ionicons name="logo-instagram" size={20} color={darkMode ? '#9ca3af' : '#6b7280'} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialIcon}>
                  <Ionicons name="logo-youtube" size={20} color={darkMode ? '#9ca3af' : '#6b7280'} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  containerDark: {
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  heroSection: {
    minHeight: height * 0.8,
    justifyContent: 'center',
    paddingHorizontal: width > 600 ? 40 : 20,
    paddingVertical: width > 600 ? 80 : 40,
    backgroundColor: '#f8f9fa',
  },
  heroSectionDark: {
    backgroundColor: '#111',
  },
  heroContent: {
    flexDirection: width > 600 ? 'row' : 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    gap: width > 600 ? 48 : 40,
  },
  heroTextContainer: {
    flex: width > 600 ? 0.48 : 1,
    width: width > 600 ? '48%' : '100%',
    justifyContent: 'center',
    paddingRight: width > 600 ? 20 : 0,
    flexShrink: 1,
    ...Platform.select({
      web: {
        minWidth: 0,
        maxWidth: '100%',
      },
    }),
  },
  heroImageContainer: {
    flex: width > 600 ? 0.52 : 1,
    width: width > 600 ? '52%' : '100%',
    alignItems: 'center',
    justifyContent: 'center',
    height: width > 600 ? 600 : Math.max(width * 0.9, 200), // Ensure minimum height
  },
  heroImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  heroTitleWrapper: {
    marginBottom: 20,
    flexDirection: 'column',
  },
  heroTitle: {
    fontSize: Platform.OS === 'android' ? (width > 600 ? 52 : 40) : Math.max(width > 600 ? 52 : 40, 14), // Android: use direct values, others: ensure minimum
    fontWeight: '800',
    color: '#000',
    lineHeight: Platform.OS === 'android' ? (width > 600 ? 62 : 48) : Math.max(width > 600 ? 62 : 48, 20), // Android: use direct values
    ...(Platform.OS === 'android' && { letterSpacing: 0 }), // Explicitly set letterSpacing to 0 on Android
    ...Platform.select({
      web: {
        wordBreak: 'normal',
        overflowWrap: 'normal',
        whiteSpace: 'normal',
        wordSpacing: 'normal',
        hyphens: 'none',
        maxWidth: '100%',
        display: 'block',
      },
      default: {
        textBreakStrategy: 'highQuality',
      },
    }),
  },
  heroTitleDark: {
    color: '#fff',
  },
  heroTitleAccent: {
    color: '#06b6d4',
  },
  heroSubtitle: {
    fontSize: Platform.OS === 'android' ? (width > 600 ? 20 : 18) : Math.max(width > 600 ? 20 : 18, 14), // Android: use direct values
    ...(Platform.OS === 'android' && { letterSpacing: 0 }), // Explicitly set letterSpacing to 0 on Android
    color: '#666',
    marginBottom: 36,
    lineHeight: width > 600 ? 30 : 26,
  },
  heroSubtitleDark: {
    color: '#ccc',
  },
  heroSubtitleBold: {
    fontWeight: '700',
    color: '#000',
  },
  heroSubtitleBoldDark: {
    color: '#fff',
  },
  heroButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#06b6d4',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 30,
    gap: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#000',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 30,
    gap: 8,
  },
  secondaryButtonDark: {
    borderColor: '#fff',
  },
  secondaryButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButtonTextDark: {
    color: '#fff',
  },
  logosSection: {
    paddingVertical: 40,
    backgroundColor: '#f8f9fa',
  },
  logosSectionDark: {
    backgroundColor: '#111',
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
    color: '#000',
  },
  sectionTitleDark: {
    color: '#fff',
  },
  logosContainer: {
    paddingHorizontal: 20,
    gap: 32,
    alignItems: 'center',
  },
  marqueeContainer: {
    overflow: 'hidden',
    height: 100,
    justifyContent: 'center',
    width: '100%',
    position: 'relative',
  },
  marqueeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 64,
    flexShrink: 0,
    ...Platform.select({
      web: {
        width: 'max-content',
      },
      default: {
        width: 'auto',
      },
    }),
  },
  logoContainer: {
    width: 100,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.7,
    flexShrink: 0,
  },
  logoImage: {
    width: '100%',
    height: '100%',
    opacity: 0.8,
  },
  statsSection: {
    paddingVertical: 40,
    backgroundColor: '#fff',
  },
  statsSectionDark: {
    backgroundColor: '#000',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 16,
  },
  statCard: {
    flex: 1,
    minWidth: width / 2 - 24,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statCardDark: {
    backgroundColor: 'rgba(31, 41, 55, 0.9)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: '#06b6d4',
    marginTop: 8,
    marginBottom: 4,
  },
  statNumberDark: {
    color: '#06b6d4',
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  statLabelDark: {
    color: '#999',
  },
  categoriesSection: {
    paddingVertical: 40,
    backgroundColor: '#fff',
  },
  categoriesSectionDark: {
    backgroundColor: '#000',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  categoryCard: {
    width: width / 2 - 22,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  categoryCardDark: {
    backgroundColor: 'rgba(31, 41, 55, 0.9)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 4,
    color: '#000',
  },
  categoryTitleDark: {
    color: '#fff',
  },
  categoryCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  freelancersSection: {
    paddingVertical: 40,
    backgroundColor: '#fff',
  },
  freelancersSectionDark: {
    backgroundColor: '#000',
  },
  freelancersContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  freelancerCard: {
    width: width * 0.75,
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  freelancerCardDark: {
    backgroundColor: 'rgba(31, 41, 55, 0.9)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  freelancerAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  freelancerAvatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  freelancerBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#06b6d4',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  freelancerName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
    color: '#000',
  },
  freelancerNameDark: {
    color: '#fff',
  },
  freelancerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#06b6d4',
    marginBottom: 12,
  },
  freelancerSkills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 16,
  },
  skillTag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  skillTagDark: {
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  skillTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#000',
  },
  skillTagTextDark: {
    color: '#fff',
  },
  freelancerRate: {
    fontSize: 18,
    fontWeight: '700',
    color: '#06b6d4',
  },
  testimonialsSection: {
    paddingVertical: 40,
    backgroundColor: '#fff',
  },
  testimonialsSectionDark: {
    backgroundColor: '#000',
  },
  testimonialsGrid: {
    paddingHorizontal: 20,
    gap: 16,
  },
  testimonialCard: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  testimonialCardDark: {
    backgroundColor: 'rgba(31, 41, 55, 0.9)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  testimonialIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#06b6d4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  testimonialQuoteMark: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '700',
  },
  testimonialText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  testimonialTextDark: {
    color: '#ccc',
  },
  testimonialAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  testimonialAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  testimonialAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  testimonialName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  testimonialNameDark: {
    color: '#fff',
  },
  testimonialRole: {
    fontSize: 12,
    fontWeight: '600',
    color: '#06b6d4',
  },
  ctaSection: {
    paddingVertical: 60,
    paddingHorizontal: 20,
    backgroundColor: '#000',
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  ctaSubtitle: {
    fontSize: 18,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 26,
  },
  ctaSubtitleBold: {
    fontWeight: '700',
    color: '#fff',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#06b6d4',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    gap: 8,
  },
  ctaButtonText: {
    color: '#06b6d4',
    fontSize: 18,
    fontWeight: '700',
  },
  footer: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: '#1f2937',
  },
  footerDark: {
    backgroundColor: '#111827',
  },
  footerContent: {
    maxWidth: width,
    alignSelf: 'center',
  },
  footerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 32,
    gap: 24,
  },
  footerColumn: {
    flex: 1,
    minWidth: width / 2 - 30,
  },
  footerColumnTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#e5e7eb',
    marginBottom: 16,
  },
  footerColumnTitleDark: {
    color: '#f3f4f6',
  },
  footerLink: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 12,
  },
  footerLinkDark: {
    color: '#6b7280',
  },
  footerBottom: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  footerBottomLeft: {
    flex: 1,
    minWidth: width / 2 - 30,
  },
  footerCopyright: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 8,
  },
  footerCopyrightDark: {
    color: '#6b7280',
  },
  footerMadeWith: {
    fontSize: 12,
    color: '#6b7280',
  },
  footerMadeWithDark: {
    color: '#4b5563',
  },
  footerSocial: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  footerFollowUs: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
  },
  footerFollowUsDark: {
    color: '#6b7280',
  },
  socialIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  socialIcon: {
    padding: 4,
  },
});

export default HomeFinal;
