import { useLocalSearchParams, Stack } from 'expo-router';
import { useState, useEffect } from 'react';
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Image,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { IngredientsList, StepsList } from '../../components/RecipeSection';
import { searchRecipe } from '../../services/gemini';

// YouTube video search - returns video based on dish name
const getYouTubeVideo = (dishName) => {
  const searchQuery = encodeURIComponent(`${dishName} recipe cooking`);
  return {
    searchUrl: `https://www.youtube.com/results?search_query=${searchQuery}`,
    // Placeholder thumbnails for common cuisines
    thumbnail: 'https://i.ytimg.com/vi/ZJy1ajvMU1k/hqdefault.jpg',
  };
};

export default function AIRecipeDetail() {
  const params = useLocalSearchParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);

  useEffect(() => {
    if (params.data) {
      try {
        setRecipe(JSON.parse(params.data));
      } catch (_) {
        setError('Failed to load recipe data.');
      }
      setLoading(false);
    } else if (params.name) {
      searchRecipe(params.name)
        .then(setRecipe)
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    } else {
      setError('No recipe specified.');
      setLoading(false);
    }

    // Cleanup speech on unmount
    return () => {
      Speech.stop();
    };
  }, []);

  const speakStep = (step, index) => {
    Speech.stop();
    setCurrentStep(index);
    setIsSpeaking(true);
    Speech.speak(`Step ${index + 1}: ${step}`, {
      language: 'en',
      rate: 0.9,
      onDone: () => {
        setIsSpeaking(false);
        setCurrentStep(-1);
      },
      onStopped: () => {
        setIsSpeaking(false);
        setCurrentStep(-1);
      },
    });
  };

  const speakAllSteps = () => {
    if (!recipe?.steps) return;
    Speech.stop();
    setIsSpeaking(true);
    setCurrentStep(0);

    const fullText = recipe.steps
      .map((step, i) => `Step ${i + 1}: ${step}`)
      .join('. ');

    Speech.speak(fullText, {
      language: 'en',
      rate: 0.85,
      onDone: () => {
        setIsSpeaking(false);
        setCurrentStep(-1);
      },
      onStopped: () => {
        setIsSpeaking(false);
        setCurrentStep(-1);
      },
    });
  };

  const stopSpeaking = () => {
    Speech.stop();
    setIsSpeaking(false);
    setCurrentStep(-1);
  };

  const speakIngredients = () => {
    if (!recipe?.ingredients) return;
    Speech.stop();
    setIsSpeaking(true);

    const ingredientText = recipe.ingredients
      .map((ing) => `${ing.qty} ${ing.item}`)
      .join(', ');

    Speech.speak(`You will need: ${ingredientText}`, {
      language: 'en',
      rate: 0.9,
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Stack.Screen options={{ title: params.name || 'Recipe' }} />
        <ActivityIndicator size="large" color="#e67e22" />
        <Text style={styles.loadingText}>Generating recipe with AI...</Text>
      </View>
    );
  }

  if (error || !recipe) {
    return (
      <View style={styles.center}>
        <Stack.Screen options={{ title: 'Error' }} />
        <Text style={styles.errorText}>{error || 'Something went wrong.'}</Text>
      </View>
    );
  }

  const youtubeVideo = getYouTubeVideo(recipe.name);

  return (
    <>
      <Stack.Screen options={{ title: recipe.name }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{recipe.name}</Text>
          {recipe.country && (
            <View style={styles.countryBadge}>
              <Text style={styles.countryText}>{recipe.country}</Text>
            </View>
          )}
        </View>

        {recipe.description && (
          <Text style={styles.description}>{recipe.description}</Text>
        )}

        {/* Voice Assistant Controls */}
        <View style={styles.voiceSection}>
          <View style={styles.voiceHeader}>
            <Ionicons name="mic" size={20} color="#e67e22" />
            <Text style={styles.voiceTitle}>Voice Assistant</Text>
          </View>
          <View style={styles.voiceButtons}>
            <Pressable
              style={[styles.voiceBtn, isSpeaking && styles.voiceBtnActive]}
              onPress={isSpeaking ? stopSpeaking : speakAllSteps}
            >
              <Ionicons
                name={isSpeaking ? 'stop' : 'play'}
                size={18}
                color="#fff"
              />
              <Text style={styles.voiceBtnText}>
                {isSpeaking ? 'Stop' : 'Read All Steps'}
              </Text>
            </Pressable>
            <Pressable
              style={styles.voiceBtnSecondary}
              onPress={speakIngredients}
            >
              <Ionicons name="list" size={18} color="#e67e22" />
              <Text style={styles.voiceBtnTextSecondary}>Read Ingredients</Text>
            </Pressable>
          </View>
        </View>

        {/* Watch Video Section */}
        <View style={styles.videoSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="logo-youtube" size={22} color="#FF0000" />
            <Text style={styles.sectionTitle}>Watch How to Make</Text>
          </View>
          <Pressable
            style={styles.videoCard}
            onPress={() => Linking.openURL(youtubeVideo.searchUrl)}
          >
            <View style={styles.videoThumbnailContainer}>
              <Image
                source={{ uri: youtubeVideo.thumbnail }}
                style={styles.videoThumbnail}
              />
              <View style={styles.playButton}>
                <Ionicons name="play" size={30} color="#fff" />
              </View>
            </View>
            <View style={styles.videoInfo}>
              <Text style={styles.videoTitle}>
                Search "{recipe.name}" recipes on YouTube
              </Text>
              <Text style={styles.videoSubtitle}>
                Tap to find video tutorials
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Ingredients */}
        {recipe.ingredients && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="restaurant-outline" size={20} color="#e67e22" />
              <Text style={styles.sectionTitle}>Ingredients</Text>
            </View>
            {recipe.ingredients.map((ing, index) => (
              <View key={index} style={styles.ingredientRow}>
                <View style={styles.ingredientDot} />
                <Text style={styles.ingredientText}>
                  <Text style={styles.ingredientQty}>{ing.qty}</Text> {ing.item}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Steps with Voice */}
        {recipe.steps && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="list-outline" size={20} color="#e67e22" />
              <Text style={styles.sectionTitle}>Instructions</Text>
            </View>
            {recipe.steps.map((step, index) => (
              <Pressable
                key={index}
                style={[
                  styles.stepCard,
                  currentStep === index && styles.stepCardActive,
                ]}
                onPress={() => speakStep(step, index)}
              >
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepText}>{step}</Text>
                  <View style={styles.stepActions}>
                    <Ionicons
                      name={currentStep === index ? 'volume-high' : 'volume-medium-outline'}
                      size={16}
                      color={currentStep === index ? '#e67e22' : '#999'}
                    />
                    <Text style={styles.stepHint}>
                      {currentStep === index ? 'Speaking...' : 'Tap to hear'}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#888',
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  name: {
    fontSize: 26,
    fontWeight: '700',
    color: '#333',
  },
  countryBadge: {
    backgroundColor: '#e67e22',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 15,
    color: '#777',
    marginTop: 8,
    lineHeight: 22,
  },
  voiceSection: {
    backgroundColor: '#fff8f0',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#f0d9c0',
  },
  voiceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  voiceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  voiceButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  voiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#e67e22',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  voiceBtnActive: {
    backgroundColor: '#c0392b',
  },
  voiceBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  voiceBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e67e22',
  },
  voiceBtnTextSecondary: {
    color: '#e67e22',
    fontWeight: '600',
    fontSize: 14,
  },
  videoSection: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  videoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  videoThumbnailContainer: {
    position: 'relative',
  },
  videoThumbnail: {
    width: '100%',
    height: 180,
    backgroundColor: '#ddd',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -25,
    marginLeft: -25,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoInfo: {
    padding: 14,
  },
  videoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  videoSubtitle: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
  },
  section: {
    marginTop: 24,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
    borderRadius: 8,
  },
  ingredientDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e67e22',
    marginRight: 12,
  },
  ingredientText: {
    fontSize: 15,
    color: '#444',
  },
  ingredientQty: {
    fontWeight: '600',
    color: '#333',
  },
  stepCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  stepCardActive: {
    backgroundColor: '#fff8f0',
    borderWidth: 1,
    borderColor: '#e67e22',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e67e22',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  stepContent: {
    flex: 1,
  },
  stepText: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
  stepActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  stepHint: {
    fontSize: 12,
    color: '#999',
  },
});
