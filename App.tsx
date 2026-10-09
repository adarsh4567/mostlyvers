import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './src/store';
import { LinkingOptions, NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { navigationRef } from './src/services/api';
import { configureApiAuthHandlers } from './src/services/api';
import { clearAuth, setSession, updateAccessToken } from './src/store/slices/authSlice';
import Toast from 'react-native-toast-message';
import NetInfo from '@react-native-community/netinfo';
import { useSelector } from 'react-redux';
import { RootState } from './src/store';
import { flushProgressQueue } from './src/services/progressQueue';
import { downloadService } from './src/services/downloadService';
import { useFonts } from 'expo-font';
import { notificationService } from './src/services/notificationService';

configureApiAuthHandlers({
  onSession: session => store.dispatch(setSession(session)),
  onToken: token => store.dispatch(updateAccessToken(token)),
  onLogout: () => store.dispatch(clearAuth()),
});

const linking: LinkingOptions<any> = {
  prefixes: ['mostlyvers://'],
  config: {
    screens: {
      Auth: {
        screens: {
          ResetPassword: 'reset-password/:token',
        },
      },
    },
  },
};

const ProgressSync = () => {
  const authenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const readerId = useSelector((state: RootState) => state.auth.user?.id);
  useEffect(() => {
    if (!authenticated || !readerId) return;
    flushProgressQueue().catch(() => undefined);
    downloadService.restoreReaderDownloads(readerId).catch(() => undefined);
	notificationService.register().catch(() => undefined);
    return NetInfo.addEventListener(state => {
      if (state.isConnected && state.isInternetReachable !== false) flushProgressQueue().catch(() => undefined);
    });
  }, [authenticated, readerId]);
  return null;
};

export default function App() {
  const [fontsLoaded] = useFonts({
    CormorantGaramond_400Regular: require('@expo-google-fonts/cormorant-garamond/400Regular/CormorantGaramond_400Regular.ttf'),
    CormorantGaramond_600SemiBold: require('@expo-google-fonts/cormorant-garamond/600SemiBold/CormorantGaramond_600SemiBold.ttf'),
    CormorantGaramond_700Bold: require('@expo-google-fonts/cormorant-garamond/700Bold/CormorantGaramond_700Bold.ttf'),
    Lato_400Regular: require('@expo-google-fonts/lato/400Regular/Lato_400Regular.ttf'),
    Lato_700Bold: require('@expo-google-fonts/lato/700Bold/Lato_700Bold.ttf'),
    Lato_900Black: require('@expo-google-fonts/lato/900Black/Lato_900Black.ttf'),
  });
  if (!fontsLoaded) return null;

  return (
    <Provider store={store}>
      <ProgressSync />
      <NavigationContainer ref={navigationRef} linking={linking}>
        <AppNavigator />
      </NavigationContainer>
      <Toast />
    </Provider>
  );
}
