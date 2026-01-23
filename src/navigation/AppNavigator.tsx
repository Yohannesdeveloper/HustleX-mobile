import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Provider } from 'react-redux';
import { store } from '../store/index-react-native';
import { WebSocketProvider } from '../context/WebSocketContext-react-native';

// Import converted screens
import HomeFinal from '../screens/HomeFinal.rn';
import Signup from '../screens/Signup.rn';
import JobListings from '../screens/JobListings.rn';
import JobDetailsMongo from '../screens/JobDetailsMongo.rn';
import PostJob from '../screens/PostJob.rn';
import Login from '../screens/Login.rn';
import HiringDashboard from '../screens/HiringDashboard.rn';
import FreelancerDashboard from '../screens/FreelancerDashboard.rn';
import FreelancerMessages from '../screens/FreelancerMessages.rn';
import ChatMessages from '../screens/ChatMessages.rn';
import FindFreelancers from '../screens/FindFreelancers.rn';
import Pricing from '../screens/Pricing.rn';
import ApplicationsManagementMongo from '../screens/ApplicationsManagementMongo.rn';
import RoleSelection from '../screens/RoleSelection.rn';
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

function MainTabs() {
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

export default function AppNavigator() {
  return (
    <Provider store={store}>
      <WebSocketProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="HomeFinal">
            <Stack.Screen 
              name="HomeFinal" 
              component={HomeFinal}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Signup" 
              component={Signup}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Login" 
              component={Login}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="PostJob" 
              component={PostJob}
              options={{ title: 'Post Job' }}
            />
            <Stack.Screen 
              name="JobListings" 
              component={JobListings}
              options={{ title: 'Job Listings' }}
            />
            <Stack.Screen 
              name="JobDetails" 
              component={JobDetailsMongo}
              options={{ title: 'Job Details' }}
            />
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
              name="FindFreelancers" 
              component={FindFreelancers}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="CompanyProfile" 
              component={CompanyProfile}
              options={{ title: 'Company Profile' }}
            />
            <Stack.Screen 
              name="FreelancerProfileSetup" 
              component={FreelancerProfileSetup}
              options={{ title: 'Freelancer Profile Setup' }}
            />
            <Stack.Screen 
              name="PreviewJob" 
              component={PreviewJob}
              options={{ title: 'Preview Job' }}
            />
            <Stack.Screen 
              name="AboutUs" 
              component={AboutUs}
              options={{ title: 'About Us' }}
            />
            <Stack.Screen 
              name="ContactUs" 
              component={ContactUs}
              options={{ title: 'Contact Us' }}
            />
            <Stack.Screen 
              name="FAQ" 
              component={FAQ}
              options={{ title: 'FAQ' }}
            />
            <Stack.Screen 
              name="Blog" 
              component={Blog}
              options={{ title: 'Blog' }}
            />
            <Stack.Screen 
              name="AccountSettings" 
              component={AccountSettings}
              options={{ title: 'Account Settings' }}
            />
            <Stack.Screen 
              name="SantimPayWizard" 
              component={SantimPayWizard}
              options={{ title: 'Santim Pay' }}
            />
            <Stack.Screen 
              name="BlogPost" 
              component={BlogPostView}
              options={{ title: 'Blog Post' }}
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
              name="Chat" 
              component={Chat}
              options={{ title: 'Chat' }}
            />
            <Stack.Screen 
              name="Pricing" 
              component={Pricing}
              options={{ title: 'Pricing' }}
            />
            <Stack.Screen 
              name="RoleSelection" 
              component={RoleSelection}
              options={{ title: 'Choose Your Role' }}
            />
            <Stack.Screen 
              name="Payment" 
              component={Payment}
              options={{ title: 'Payment' }}
            />
            <Stack.Screen 
              name="ForgotPassword" 
              component={ForgotPassword}
              options={{ title: 'Forgot Password' }}
            />
            <Stack.Screen 
              name="HowItWorks" 
              component={HowItWorks}
              options={{ title: 'How It Works' }}
            />
            <Stack.Screen 
              name="HelpCenter" 
              component={HelpCenter}
              options={{ title: 'Help Center' }}
            />
            <Stack.Screen 
              name="EditJob" 
              component={EditJobMongo}
              options={{ title: 'Edit Job' }}
            />
            <Stack.Screen 
              name="EditBlog" 
              component={EditBlog}
              options={{ title: 'Edit Blog' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </WebSocketProvider>
    </Provider>
  );
}
