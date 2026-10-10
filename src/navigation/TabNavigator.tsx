import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigatorScreenParams } from '@react-navigation/native';
import { Colors, Fonts } from '../theme';

// Screen Imports
import HomeScreen from '../screens/home/HomeScreen';
import LibraryScreen from '../screens/library/LibraryScreen';
import BookDetailsScreen from '../screens/library/BookDetailsScreen';
import ReadingScreen from '../screens/reading/ReadingScreen';
import BookReaderScreen from '../screens/reading/BookReaderScreen';
import FeedbackScreen from '../screens/reading/FeedbackScreen';
import LatestScreen from '../screens/latest/LatestScreen';
import UpcomingScreen from '../screens/upcoming/UpcomingScreen';
import QRScreen from '../screens/qr/QRScreen';
import AccountScreen from '../screens/account/AccountScreen';
import ProfileScreen from '../screens/account/ProfileScreen';
import DeviceAccessScreen from '../screens/account/DeviceAccessScreen';
import PaymentHistoryScreen from '../screens/account/PaymentHistoryScreen';
import DownloadsScreen from '../screens/account/DownloadsScreen';
import AboutAppScreen from '../screens/account/AboutAppScreen';
import ContactScreen from '../screens/account/ContactScreen';
import AboutAuthorScreen from '../screens/account/AboutAuthorScreen';
import NotificationsScreen from '../screens/account/NotificationsScreen';

import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { shouldShowFloatingTabBar } from './tabBarVisibility';

export type HomeStackParamList = { HomeScreen: undefined };
export type LibraryStackParamList = { LibraryScreen: undefined; BookDetailsScreen: { bookId: string } };
export type ReadingStackParamList = { ReadingScreen: undefined; BookReaderScreen: { bookId: string; startPage?: number; offline?: boolean }; FeedbackScreen: { bookId: string } };
export type LatestStackParamList = { LatestScreen: undefined; BookDetailsScreen: { bookId: string } };
export type UpcomingStackParamList = { UpcomingScreen: undefined };
export type QRStackParamList = { QRScreen: undefined; BookDetailsScreen: { bookId: string } };
export type AccountStackParamList = {
  AccountScreen: undefined; ProfileScreen: undefined; DeviceAccessScreen: undefined;
  PaymentHistoryScreen: undefined; DownloadsScreen: undefined; AboutAppScreen: undefined;
  ContactScreen: undefined; AboutAuthorScreen: undefined;
	NotificationsScreen: undefined;
};
export type RootTabParamList = {
  HomeStack: NavigatorScreenParams<HomeStackParamList> | undefined;
  LibraryStack: NavigatorScreenParams<LibraryStackParamList> | undefined;
  ReadingStack: NavigatorScreenParams<ReadingStackParamList> | undefined;
  LatestStack: NavigatorScreenParams<LatestStackParamList> | undefined;
  UpcomingStack: NavigatorScreenParams<UpcomingStackParamList> | undefined;
  QRStack: NavigatorScreenParams<QRStackParamList> | undefined;
  AccountStack: NavigatorScreenParams<AccountStackParamList> | undefined;
};

// The height the floating tab bar will occupy — screens pad their bottom by this much
export const FLOATING_TAB_BAR_HEIGHT = 70;

// ─── Tab config ───────────────────────────────────────────────────────────────
const TAB_ITEMS = [
  { name: 'HomeStack',     label: 'Home',     icon: 'home',       iconOutline: 'home-outline'      },
  { name: 'LibraryStack',  label: 'Library',  icon: 'book',       iconOutline: 'book-outline'      },
  { name: 'ReadingStack',  label: 'Reading',  icon: 'reader',     iconOutline: 'reader-outline'    },
  { name: 'LatestStack',   label: 'Latest',   icon: 'sparkles',   iconOutline: 'sparkles-outline'  },
  { name: 'UpcomingStack', label: 'Upcoming', icon: 'hourglass',  iconOutline: 'hourglass-outline' },
  { name: 'QRStack',       label: 'QR',       icon: 'qr-code',    iconOutline: 'qr-code-outline'   },
  { name: 'AccountStack',  label: 'Account',  icon: 'person',     iconOutline: 'person-outline'    },
];

// ─── Custom Tab Bar ────────────────────────────────────────────────────────────
const FloatingTabBar = ({ state, descriptors, navigation }: any) => {
  const insets = useSafeAreaInsets();
  const bottomInset = insets.bottom > 0 ? insets.bottom : 12;

  if (!shouldShowFloatingTabBar(state)) return null;

  return (
    <View style={[styles.floatingBar, { bottom: bottomInset }]}>
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;
        const tab = TAB_ITEMS[index];

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <View key={route.key} style={styles.tabItem} >
            <TouchableOpacity
              accessibilityRole="tab"
              accessibilityState={{ selected: isFocused }}
              onPress={onPress}
              style={[styles.tabSurface, isFocused && styles.tabSurfaceActive]}
            >
              <View style={styles.iconWrap}>
                <Ionicons
                  name={isFocused ? tab.icon : tab.iconOutline as any}
                  size={22}
                  color={isFocused ? Colors.white : Colors.textSecondary}
                />
              </View>
              <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>{tab.label}</Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
};

// ─── Stacks ───────────────────────────────────────────────────────────────────
const Home = createNativeStackNavigator<HomeStackParamList>();
const HomeStack = () => (
  <Home.Navigator screenOptions={{ headerShown: false }}>
    <Home.Screen name="HomeScreen" component={HomeScreen} />
  </Home.Navigator>
);

const Library = createNativeStackNavigator<LibraryStackParamList>();
const LibraryStack = () => (
  <Library.Navigator screenOptions={{ headerShown: false }}>
    <Library.Screen name="LibraryScreen" component={LibraryScreen} />
    <Library.Screen name="BookDetailsScreen" component={BookDetailsScreen} />
  </Library.Navigator>
);

const Reading = createNativeStackNavigator<ReadingStackParamList>();
const ReadingStack = () => (
  <Reading.Navigator screenOptions={{ headerShown: false }}>
    <Reading.Screen name="ReadingScreen" component={ReadingScreen} />
    <Reading.Screen name="BookReaderScreen" component={BookReaderScreen} />
    <Reading.Screen name="FeedbackScreen" component={FeedbackScreen} />
  </Reading.Navigator>
);

const Latest = createNativeStackNavigator<LatestStackParamList>();
const LatestStack = () => (
  <Latest.Navigator screenOptions={{ headerShown: false }}>
    <Latest.Screen name="LatestScreen" component={LatestScreen} />
    <Latest.Screen name="BookDetailsScreen" component={BookDetailsScreen} />
  </Latest.Navigator>
);

const Upcoming = createNativeStackNavigator<UpcomingStackParamList>();
const UpcomingStack = () => (
  <Upcoming.Navigator screenOptions={{ headerShown: false }}>
    <Upcoming.Screen name="UpcomingScreen" component={UpcomingScreen} />
  </Upcoming.Navigator>
);

const QR = createNativeStackNavigator<QRStackParamList>();
const QRStack = () => (
  <QR.Navigator screenOptions={{ headerShown: false }}>
    <QR.Screen name="QRScreen" component={QRScreen} />
    <QR.Screen name="BookDetailsScreen" component={BookDetailsScreen} />
  </QR.Navigator>
);

const Account = createNativeStackNavigator<AccountStackParamList>();
const AccountStack = () => (
  <Account.Navigator screenOptions={{ headerShown: false }}>
    <Account.Screen name="AccountScreen" component={AccountScreen} />
    <Account.Screen name="ProfileScreen" component={ProfileScreen} />
    <Account.Screen name="DeviceAccessScreen" component={DeviceAccessScreen} />
    <Account.Screen name="PaymentHistoryScreen" component={PaymentHistoryScreen} />
    <Account.Screen name="DownloadsScreen" component={DownloadsScreen} />
    <Account.Screen name="AboutAppScreen" component={AboutAppScreen} />
    <Account.Screen name="ContactScreen" component={ContactScreen} />
    <Account.Screen name="AboutAuthorScreen" component={AboutAuthorScreen} />
	<Account.Screen name="NotificationsScreen" component={NotificationsScreen} />
  </Account.Navigator>
);

// ─── Tab Navigator ─────────────────────────────────────────────────────────────
const Tab = createBottomTabNavigator<RootTabParamList>();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="HomeStack"     component={HomeStack}     options={{ tabBarLabel: 'Home'    }} />
      <Tab.Screen name="LibraryStack"  component={LibraryStack}  options={{ tabBarLabel: 'Library' }} />
      <Tab.Screen name="ReadingStack"  component={ReadingStack}  options={{ tabBarLabel: 'Reading' }} />
      <Tab.Screen name="LatestStack"   component={LatestStack}   options={{ tabBarLabel: 'Latest'  }} />
      <Tab.Screen name="UpcomingStack" component={UpcomingStack} options={{ tabBarLabel: 'Upcoming' }} />
      <Tab.Screen name="QRStack"       component={QRStack}       options={{ tabBarLabel: 'QR'      }} />
      <Tab.Screen name="AccountStack"  component={AccountStack}  options={{ tabBarLabel: 'Account' }} />
    </Tab.Navigator>
  );
};

export default TabNavigator;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  floatingBar: {
    position: 'absolute',
    left: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: Colors.cardBg,
    borderRadius: 22,
    paddingHorizontal: 4,
    paddingVertical: 5,
    // Soft espresso shadow
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 14,
    // Subtle border for definition
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
  },
  tabSurface: { width: '96%', minHeight: 54, borderRadius: 13, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 1 },
  tabSurfaceActive: { backgroundColor: Colors.primary },
  iconWrap: {
    height: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 8.5,
    fontFamily: Fonts.body,
    color: Colors.textMuted,
    letterSpacing: 0.2,
  },
  tabLabelActive: {
    color: Colors.white,
    fontFamily: Fonts.bodyBold,
  },
});
