import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Fonts, ARROW_HEART } from '../theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useGetNotificationsQuery } from '../store/apiSlice';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showLogo?: boolean;
  showBell?: boolean;
  notifCount?: number;
  leftComponent?: React.ReactNode;
  rightComponent?: React.ReactNode;
  showDivider?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showLogo,
  showBell,
	notifCount,
  leftComponent,
  rightComponent,
  showDivider = true,
}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
	const { data: notifications } = useGetNotificationsQuery(undefined, { skip: !showBell });
	const count = notifCount ?? notifications?.unreadCount ?? 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.topRow}>
        {/* Left */}
        <View style={styles.side}>
          {leftComponent ?? (showLogo ? (
              <View style={styles.brandSide}>
                <TouchableOpacity accessibilityLabel="Open account menu" onPress={() => navigation.navigate('AccountStack')} style={styles.menuButton}>
                  <Ionicons name="menu-outline" size={28} color={Colors.textPrimary} />
                </TouchableOpacity>
                <View style={styles.logoCircle}>
                <Image
                  source={require('../assets/mostlyvers-logo.png')}
                  style={styles.logo}
                  contentFit="cover"
                />
                </View>
              </View>
            ) : <View style={{ width: 40 }} />)}
        </View>

        {/* Center */}
        <View style={styles.center}>
          <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.58}>{title}</Text>
        </View>

        {/* Right */}
        <View style={[styles.side, styles.sideRight]}>
          {rightComponent ?? (
            showBell ? (
			  <TouchableOpacity style={styles.bellWrapper} onPress={() => navigation.navigate('AccountStack', { screen: 'NotificationsScreen' })} accessibilityLabel="Open notifications">
                <Ionicons name="notifications-outline" size={22} color={Colors.primary} />
				{count > 0 && (
                  <View style={styles.badge}>
					<Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
                  </View>
                )}
			  </TouchableOpacity>
            ) : <View style={{ width: 40 }} />
          )}
        </View>
      </View>

      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

      {showDivider && (
        <View style={styles.dividerRow}>
          <Text style={styles.dividerText}>{ARROW_HEART}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 14,
    paddingBottom: 10,
    backgroundColor: Colors.background,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 70,
    marginBottom: 1,
  },
  side: {
    width: 94,
    alignItems: 'flex-start',
  },
  sideRight: {
    alignItems: 'flex-end',
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  brandSide: { flexDirection: 'row', alignItems: 'center', width: 94 },
  menuButton: { width: 34, height: 42, alignItems: 'flex-start', justifyContent: 'center' },
  logoCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    overflow: 'hidden',
    backgroundColor: Colors.tagBg,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: Fonts.headingSize,
    fontFamily: Fonts.display,
    color: Colors.textPrimary,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: Fonts.smallSize,
    fontFamily: Fonts.body,
    color: Colors.textSecondary,
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  dividerRow: {
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 2,
  },
  dividerText: {
    color: Colors.accent,
    fontSize: 13,
    letterSpacing: 2,
  },
  bellWrapper: {
    position: 'relative',
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: Colors.primary,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: 'bold',
  },
});

export default Header;
