import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StatusBar, Text, LogBox } from 'react-native';

// Suppress harmless React Navigation internal warning
LogBox.ignoreLogs(['InteractionManager']);
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
  JetBrainsMono_700Bold,
} from '@expo-google-fonts/jetbrains-mono';

// Database & Store
import { initDB } from './db/schema';
import { seedDB } from './db/seed';
import { useStore } from './store/useStore';
import { useAuthStore } from './store/authStore';
import { colors } from './theme';
import * as SecureStore from 'expo-secure-store';

// Screens
import HomeScreen     from './app/home';
import ForecastScreen from './app/forecast';
import GigScreen      from './app/gig';
import FamilyScreen   from './app/family';
import SettingsScreen from './app/settings';
import LoginScreen    from './app/login';
import SignupScreen   from './app/signup';

// Stack screens (modals)
import AlertsScreen  from './app/alerts';
import DoomScreen    from './app/doom';
import BreatheScreen from './app/breathe';
import JugaadScreen  from './app/jugaad';
import CoachScreen   from './app/coach';
import SchemesScreen from './app/schemes';
import AddTxnScreen  from './app/addTransaction';
import OnboardScreen from './app/onboard';
import TransactionsScreen from './app/transactions';
import EditProfileScreen  from './app/editProfile';
import JarsScreen         from './app/jars';

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();
const AuthStack = createStackNavigator();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: colors.bg } }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
    </AuthStack.Navigator>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.s1,
          borderTopColor:  colors.border,
          borderTopWidth:  1,
          height:          64,
          paddingBottom:   10,
          paddingTop:      6,
        },
        tabBarActiveTintColor:   colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 11, fontFamily: 'Inter_500Medium' },
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, string> = {
            Home:     'home-outline',
            Forecast: 'stats-chart-outline',
            Gig:      'briefcase-outline',
            Family:   'people-outline',
            Settings: 'settings-outline',
          };
          return <Ionicons name={icons[route.name] as any} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name='Home'     component={HomeScreen} />
      <Tab.Screen name='Forecast' component={ForecastScreen} />
      <Tab.Screen name='Gig'      component={GigScreen} />
      <Tab.Screen name='Family'   component={FamilyScreen} />
      <Tab.Screen name='Settings' component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [dbReady, setDbReady]         = useState(false);
  const [initialRoute, setInitialRoute] = useState<'Onboard'|'Tabs'>('Tabs');
  const refreshAll = useStore(s => s.refreshAll);
  
  const { checkAuth, isAuthenticated, isLoading: authLoading } = useAuthStore();

  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
    JetBrainsMono_700Bold,
  });

  useEffect(() => {
    async function boot() {
      try {
        await initDB();          // create tables
        await seedDB();
        await refreshAll();      // run all 3 engines
        
        await checkAuth();       // Check user session token

        // Check if user has already completed onboarding
        const onboarded = await SecureStore.getItemAsync('artha_onboarded');
        setInitialRoute(onboarded === 'true' ? 'Tabs' : 'Onboard');
      } catch (e) {
        console.error("Boot error:", e);
        setInitialRoute('Tabs'); // fallback — never block the user
      } finally {
        setDbReady(true);
      }
    }
    boot();
  }, []);

  // 1. Wait for fonts to load
  if (!fontsLoaded && !fontError) {
    return (
      <View style={{ flex:1, backgroundColor: colors.bg, justifyContent:'center', alignItems:'center' }}>
        <ActivityIndicator size='large' color={colors.accent} />
      </View>
    );
  }

  // 2. If fonts failed to load (e.g. no internet), show error and DO NOT proceed
  if (fontError) {
    return (
      <View style={{ flex:1, backgroundColor: colors.bg, justifyContent:'center', alignItems:'center', padding: 20 }}>
        <Text style={{ color: 'red', textAlign: 'center' }}>
          Error loading fonts: {fontError.message}{'\n\n'}
          Please check your internet connection and reload.
        </Text>
      </View>
    );
  }

  // 3. Wait for Database and Auth check
  if (!dbReady || authLoading) {
    return (
      <View style={{ flex:1, backgroundColor: colors.bg, justifyContent:'center', alignItems:'center' }}>
        <ActivityIndicator size='large' color={colors.accent} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle='light-content' backgroundColor={colors.bg} />
        <NavigationContainer>
          {!isAuthenticated ? (
            <AuthNavigator />
          ) : (
            <Stack.Navigator
              initialRouteName={initialRoute}
              screenOptions={{
                headerShown: false,
                cardStyle: { backgroundColor: colors.bg },
              }}
            >
              <Stack.Screen name='Onboard'  component={OnboardScreen} />
              <Stack.Screen name='Tabs'     component={TabNavigator}
                initialParams={{ initialRoute }} />
              <Stack.Screen name='Alerts'   component={AlertsScreen}
                options={{ presentation: 'modal' }} />
              <Stack.Screen name='Doom'     component={DoomScreen}
                options={{ presentation: 'modal' }} />
              <Stack.Screen name='Breathe'  component={BreatheScreen}
                options={{ presentation: 'modal' }} />
              <Stack.Screen name='Jugaad'   component={JugaadScreen}
                options={{ presentation: 'modal' }} />
              <Stack.Screen name='Coach'    component={CoachScreen}
                options={{ presentation: 'modal' }} />
              <Stack.Screen name='Schemes'  component={SchemesScreen}
                options={{ presentation: 'modal' }} />
              <Stack.Screen name='AddTxn'       component={AddTxnScreen}       options={{ presentation: 'modal' }} />
              <Stack.Screen name='Transactions' component={TransactionsScreen} options={{ presentation: 'modal' }} />
              <Stack.Screen name='EditProfile'  component={EditProfileScreen}  options={{ presentation: 'modal' }} />
              <Stack.Screen name='Jars'         component={JarsScreen}         options={{ presentation: 'modal' }} />
            </Stack.Navigator>
          )}
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}