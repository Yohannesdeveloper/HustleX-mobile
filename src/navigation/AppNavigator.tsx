import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Provider } from 'react-redux';
import { store } from '../store/index-react-native';
import { WebSocketProvider } from '../context/WebSocketContext-react-native';
import BottomNav from '../components/BottomNav.rn';

import { useAppSelector, useAppDispatch } from '../store/hooks';
import { setTotalJobsCount } from '../store/jobsSlice';
import { setTotalBlogsCount } from '../store/blogSlice';
import apiService from '../services/api-react-native';
import { useTranslation } from '../hooks/useTranslation';

// Import converted screens
import HomeFinal from '../screens/HomeFinal.rn';
import Signup from '../screens/Signup.rn';
import JobListings from '../screens/JobListings.rn';
import JobDetailsMongo from '../screens/JobDetailsMongo.rn';
import PostJob from '../screens/PostJob.rn';

import HiringDashboard from '../screens/HiringDashboard.rn';
import FreelancerDashboard from '../screens/FreelancerDashboard.rn';
import FreelancerMessages from '../screens/FreelancerMessages.rn';
import ChatMessages from '../screens/ChatMessages.rn';
import FindFreelancers from '../screens/FindFreelancers.rn';
import Pricing from '../screens/Pricing.rn';
import ApplicationsManagementMongo from '../screens/ApplicationsManagementMongo.rn';
import Payment from '../screens/Payment.rn';
import ForgotPassword from '../screens/ForgotPassword.rn';
import CompanyProfile from '../screens/CompanyProfile.rn';
import FreelancerProfileSetup from '../screens/FreelancerProfileSetup.rn';
import PreviewJob from '../screens/PreviewJob.rn';
import AboutUs from '../screens/AboutUs.rn';
import ContactUs from '../screens/ContactUs.rn';
import FAQ from '../screens/FAQ.rn';
import Blog from '../screens/Blog.rn';
import AccountSettings from '../screens/AccountSettings.rn';
import SantimPayWizard from '../screens/SantimPayWizard.rn';
import BlogPostView from '../screens/BlogPostView.rn';
import BlogAdmin from '../screens/BlogAdmin.rn';
import Chat from '../screens/Chat.rn';
import HowItWorks from '../screens/HowItWorks.rn';
import HelpCenter from '../screens/HelpCenter.rn';
import EditJobMongo from '../screens/EditJobMongo.rn';
import EditBlog from '../screens/EditBlog.rn';
import SubscriptionAdmin from '../screens/SubscriptionAdmin.rn';
import JobAdmin from '../screens/JobAdmin.rn';

// Temporary placeholders for unconverted screens
const PlaceholderScreen: React.FC<{ route: any }> = ({ route }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
    <Text style={{ fontSize: 18, textAlign: 'center', marginBottom: 8 }}>
      {route.name} - Conversion in progress...
    </Text>
    <Text style={{ fontSize: 14, textAlign: 'center', color: '#666' }}>
      This screen will be converted next
    </Text>
  </View>
);

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const TopTab = createMaterialTopTabNavigator();

// Swipeable main screens with custom bottom navigation
function MainSwipeableTabs() {
  return (
    <TopTab.Navigator
      tabBarPosition="bottom"
      tabBar={(props) => <BottomNav {...props} />}
      screenOptions={{
        swipeEnabled: true,
        lazy: true,
        animationEnabled: true,
      }}
      initialRouteName="HomeFinal"
    >
      <TopTab.Screen
        name="HomeFinal"
        component={HomeFinal}
        options={{ title: 'Home' }}
      />
      <TopTab.Screen
        name="JobListings"
        component={JobListings}
        options={{ title: 'Jobs' }}
      />
      <TopTab.Screen
        name="Blog"
        component={Blog}
        options={{ title: 'Blog' }}
      />
      <TopTab.Screen
        name="Pricing"
        component={Pricing}
        options={{ title: 'Pricing' }}
      />
      <TopTab.Screen
        name="FAQ"
        component={FAQ}
        options={{ title: 'FAQ' }}
      />
      <TopTab.Screen
        name="ContactUs"
        component={ContactUs}
        options={{ title: 'Contact' }}
      />
    </TopTab.Navigator>
  );
}

// Alternative tab navigation (not currently used as main)
function AlternativeMainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#06b6d4',
        tabBarInactiveTintColor: '#9ca3af',
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeFinal}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Jobs"
        component={JobListings}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="briefcase" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Chat"
        component={Chat}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Data Fetcher Wrapper to handle global app data
function DataFetcherWrapper() {
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    const fetchCounts = async () => {
      try {
        // Fetch Job count
        const jobResponse = await apiService.getJobs({ limit: 1 });
        if (jobResponse && jobResponse.pagination) {
          dispatch(setTotalJobsCount(jobResponse.pagination.total));
        }

        // Fetch Blog count
        const blogResponse = await apiService.getBlogs({ limit: 1 });
        if (blogResponse && blogResponse.pagination) {
          dispatch(setTotalBlogsCount(blogResponse.pagination.total));
        }
      } catch (error) {
        // Silently fail to avoid interrupting user experience
        console.log('[DataFetcher] Could not fetch counts');
      }
    };

    fetchCounts();
    // Refresh counts every 5 minutes
    const interval = setInterval(fetchCounts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [dispatch]);

  return null;
}

function NavigationStack() {
  const darkMode = useAppSelector((s) => s.theme.darkMode);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="MainSwipeableTabs"
        screenOptions={{
          headerStyle: {
            backgroundColor: darkMode ? '#000000' : '#ffffff',
          },
          headerTintColor: darkMode ? '#ffffff' : '#000000',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {/* Main swipeable screens */}
        <Stack.Screen
          name="MainSwipeableTabs"
          component={MainSwipeableTabs}
          options={{ headerShown: false }}
        />

        {/* Auth screens */}
        <Stack.Screen
          name="Signup"
          component={Signup}
          options={{ headerShown: false }}
        />

        {/* Job related screens */}
        <Stack.Screen
          name="PostJob"
          component={PostJob}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="JobDetails"
          component={JobDetailsMongo}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PreviewJob"
          component={PreviewJob}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EditJob"
          component={EditJobMongo}
          options={{ title: 'Edit Job' }}
        />

        {/* Dashboard screens */}
        <Stack.Screen
          name="HiringDashboard"
          component={HiringDashboard}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="FreelancingDashboard"
          component={FreelancerDashboard}
          options={{ headerShown: false }}
        />

        {/* Messaging screens */}
        <Stack.Screen
          name="FreelancerMessages"
          component={FreelancerMessages}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ChatMessages"
          component={ChatMessages}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Chat"
          component={Chat}
          options={{ title: 'Chat' }}
        />

        {/* Freelancer related screens */}
        <Stack.Screen
          name="FindFreelancers"
          component={FindFreelancers}
          options={{ headerShown: false }}
        />

        {/* Profile screens */}
        <Stack.Screen
          name="CompanyProfile"
          component={CompanyProfile}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="FreelancerProfileSetup"
          component={FreelancerProfileSetup}
          options={{ title: 'Freelancer Profile Setup' }}
        />
        <Stack.Screen
          name="AccountSettings"
          component={AccountSettings}
          options={{ title: 'Account Settings' }}
        />

        {/* Info screens */}
        <Stack.Screen
          name="AboutUs"
          component={AboutUs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="HowItWorks"
          component={HowItWorks}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="HelpCenter"
          component={HelpCenter}
          options={{ title: 'Help Center' }}
        />

        {/* Blog screens */}
        <Stack.Screen
          name="BlogPost"
          component={BlogPostView}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="BlogEdit"
          component={BlogAdmin}
          options={{ title: 'Edit Blog' }}
        />
        <Stack.Screen
          name="BlogAdmin"
          component={BlogAdmin}
          options={{ title: 'Blog Admin' }}
        />
        <Stack.Screen
          name="EditBlog"
          component={EditBlog}
          options={{ title: 'Edit Blog' }}
        />

        {/* Payment screens */}
        <Stack.Screen
          name="Pricing"
          component={Pricing}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SantimPayWizard"
          component={SantimPayWizard}
          options={{ title: 'Santim Pay', headerShown: false }}
        />
        <Stack.Screen
          name="Payment"
          component={Payment}
          options={{ title: 'Payment', headerShown: false }}
        />
        <Stack.Screen
          name="SubscriptionAdmin"
          component={SubscriptionAdmin}
          options={{ title: 'Subscription Admin', headerShown: false }}
        />
        <Stack.Screen
          name="JobAdmin"
          component={JobAdmin}
          options={{ title: 'Job Admin', headerShown: false }}
        />

        <Stack.Screen
          name="ForgotPassword"
          component={ForgotPassword}
          options={{ title: 'Forgot Password' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function AppNavigator() {
  return (
    <Provider store={store}>
      <WebSocketProvider>
        <DataFetcherWrapper />
        <NavigationStack />
      </WebSocketProvider>
    </Provider>
  );
}
