import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Colors, Fonts } from '../../theme';
import Header from '../../components/Header';
import BackButton from '../../components/BackButton';
import { contentService } from '../../services/contentService';

const AboutAppScreen = () => {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await contentService.getAboutApp();
        setContent(response.content);
      } catch (error) {
        console.error('Error fetching about app', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchContent();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="About App" leftComponent={<BackButton />} />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Rules & Policies</Text>
        <Text style={styles.bodyText}>
          {content}
        </Text>

      </ScrollView>
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
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: Fonts.subheadingSize,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: 24,
    marginBottom: 8,
  },
  bodyText: {
    fontSize: Fonts.bodySize,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
});

export default AboutAppScreen;
