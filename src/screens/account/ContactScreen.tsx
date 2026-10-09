import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import { Colors, Fonts, Radii, Shadows } from '../../theme';
import Header from '../../components/Header';
import BackButton from '../../components/BackButton';
import { contentService } from '../../services/contentService';
import Ionicons from '@expo/vector-icons/Ionicons';
import { getMailtoUrl, getSafeHttpsUrl, getSafeYoutubeUrl } from '../../utils/links';

const ContactScreen = () => {
  const [contactInfo, setContactInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const response = await contentService.getContact();
        setContactInfo(response);
      } catch (error) {
        console.error('Error fetching contact info', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchContact();
  }, []);

  const openLink = (url: string | null) => {
    if (!url) return;
    Linking.openURL(url).catch(() => undefined);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Contact Us" leftComponent={<BackButton />} />

      <View style={styles.content}>
        <Text style={styles.headerText}>Connect with MOSTLYVERS</Text>

        <TouchableOpacity
          style={styles.card}
          onPress={() => openLink(getSafeHttpsUrl(contactInfo.instagramUrl, ['instagram.com', 'www.instagram.com']))}
        >
          <Ionicons name="logo-instagram" size={24} color="#E1306C" />
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>Instagram</Text>
            <Text style={styles.cardSubtitle}>{contactInfo.instagramName}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.border} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => openLink(getSafeYoutubeUrl(contactInfo.youtubeUrl))}
        >
          <Ionicons name="logo-youtube" size={24} color="#FF0000" />
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>YouTube</Text>
            <Text style={styles.cardSubtitle}>{contactInfo.youtubeName}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.border} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => openLink(getMailtoUrl(contactInfo.email))}
        >
          <Ionicons name="mail" size={24} color={Colors.primary} />
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>Email</Text>
            <Text style={styles.cardSubtitle}>{contactInfo.email}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.border} />
        </TouchableOpacity>

        {contactInfo.supportEmail && (
          <TouchableOpacity
            style={styles.card}
            onPress={() => openLink(getMailtoUrl(contactInfo.supportEmail))}
          >
            <Ionicons name="help-buoy" size={24} color={Colors.accent} />
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>Support</Text>
              <Text style={styles.cardSubtitle}>{contactInfo.supportEmail}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.border} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 24,
  },
  headerText: {
    fontSize: Fonts.subheadingSize,
    color: Colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    padding: 16,
    borderRadius: Radii.card,
    marginBottom: 16,
    ...Shadows.card,
  },
  cardInfo: {
    flex: 1,
    marginLeft: 16,
  },
  cardTitle: {
    fontSize: Fonts.bodySize,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  cardSubtitle: {
    fontSize: Fonts.smallSize,
    color: Colors.textSecondary,
    marginTop: 4,
  },
});

export default ContactScreen;
