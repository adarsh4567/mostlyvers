import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Colors, Fonts } from '../../theme';
import Header from '../../components/Header';
import BackButton from '../../components/BackButton';
import { contentService, AuthorContent } from '../../services/contentService';
import Ionicons from '@expo/vector-icons/Ionicons';

const AboutAuthorScreen = () => {
  const [author, setAuthor] = useState<AuthorContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const fetchAuthor = async () => {
      try {
        const response = await contentService.getAuthor();
        setAuthor(response);
      } catch (error) {
        console.error('Error fetching author', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAuthor();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  if (!author) return null;

  return (
    <View style={styles.container}>
      <Header title="About Author" leftComponent={<BackButton />} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.imageContainer}>
          <Image source={author.photoUrl} style={styles.image} contentFit="cover" />
          <View style={styles.overlay}>
            <Text style={styles.name}>{author.name}</Text>
          </View>
        </View>

        <Text style={styles.bioSnippet}>{author.bioSnippet}</Text>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Biography</Text>
        <Text style={styles.fullBio} numberOfLines={expanded ? undefined : 6}>
          {author.fullBio}
        </Text>

        <TouchableOpacity
          style={styles.readMoreBtn}
          onPress={() => setExpanded(!expanded)}
        >
          <Text style={styles.readMoreText}>{expanded ? 'Read Less' : 'Read More'}</Text>
          <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={16} color={Colors.accent} />
        </TouchableOpacity>
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
  imageContainer: {
    width: '100%',
    height: 300,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
    padding: 24,
  },
  name: {
    color: Colors.white,
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  bioSnippet: {
    fontSize: Fonts.subheadingSize,
    color: Colors.textPrimary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  fullBio: {
    fontSize: Fonts.bodySize,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  readMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 16,
    padding: 8,
  },
  readMoreText: {
    color: Colors.accent,
    fontWeight: 'bold',
    marginRight: 4,
  },
});

export default AboutAuthorScreen;
