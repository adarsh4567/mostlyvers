import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { Colors, Fonts, Radii } from '../../theme';
import Header from '../../components/Header';
import BackButton from '../../components/BackButton';
import { feedbackService } from '../../services/feedbackService';
import Toast from 'react-native-toast-message';

type ParamList = {
  Feedback: { bookId: string };
};

const FeedbackScreen = () => {
  const route = useRoute<RouteProp<ParamList, 'Feedback'>>();
  const navigation = useNavigation();
  const { bookId } = route.params;

  const [feedbackText, setFeedbackText] = useState('');
  const [existingFeedbackId, setExistingFeedbackId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const feedback = await feedbackService.getMyFeedback(bookId);
        if (feedback) {
          setFeedbackText(feedback.text);
          setExistingFeedbackId(feedback.id);
          setIsEditing(false); // Show as read-only if it exists
        }
      } catch (error) {
        console.error('Error fetching feedback', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeedback();
  }, [bookId]);

  const handleSubmit = async () => {
    if (!feedbackText.trim()) return;

    setIsSubmitting(true);
    try {
      if (existingFeedbackId) {
        await feedbackService.updateFeedback(bookId, feedbackText);
      } else {
        const res = await feedbackService.submitFeedback(bookId, feedbackText);
        setExistingFeedbackId(res.id);
      }
      setIsEditing(false);
      Toast.show({ type: 'success', text1: 'Success', text2: 'Feedback saved successfully.' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to save feedback.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header title="Feedback" leftComponent={<BackButton />} />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.prompt}>
          We'd love to hear your thoughts on this story. Your feedback helps the author grow and create better worlds.
        </Text>

        <TextInput
          style={[styles.input, !isEditing && styles.inputDisabled]}
          placeholder="Share your thoughts here..."
          placeholderTextColor={Colors.textSecondary}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          value={feedbackText}
          onChangeText={setFeedbackText}
          editable={isEditing}
        />

        {isEditing ? (
          <TouchableOpacity
            style={[styles.button, (!feedbackText.trim() || isSubmitting) && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={!feedbackText.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.buttonText}>SUBMIT FEEDBACK</Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.buttonOutline}
            onPress={() => setIsEditing(true)}
          >
            <Text style={styles.buttonOutlineText}>EDIT FEEDBACK</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
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
  prompt: {
    fontSize: Fonts.bodySize,
    color: Colors.textSecondary,
    marginBottom: 24,
    lineHeight: 22,
  },
  input: {
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.input,
    padding: 16,
    fontSize: Fonts.bodySize,
    color: Colors.textPrimary,
    minHeight: 150,
    marginBottom: 24,
  },
  inputDisabled: {
    backgroundColor: '#F0EBE6',
    color: Colors.textSecondary,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: Radii.button,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: Colors.white,
    fontSize: Fonts.subheadingSize,
    fontWeight: 'bold',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: Radii.button,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  buttonOutlineText: {
    color: Colors.primary,
    fontSize: Fonts.subheadingSize,
    fontWeight: 'bold',
  },
});

export default FeedbackScreen;
