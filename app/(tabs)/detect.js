import { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { detectFood } from '../../services/gemini';
import { IngredientsList, StepsList } from '../../components/RecipeSection';

export default function DetectScreen() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const pickImage = async (useCamera) => {
    const method = useCamera
      ? ImagePicker.launchCameraAsync
      : ImagePicker.launchImageLibraryAsync;

    const res = await method({
      mediaTypes: ['images'],
      quality: 0.7,
      base64: true,
    });

    if (!res.canceled && res.assets[0]) {
      setImage(res.assets[0].uri);
      setResult(null);
      analyzeFood(res.assets[0].base64);
    }
  };

  const analyzeFood = async (base64) => {
    setLoading(true);
    try {
      const data = await detectFood(base64);
      setResult(data);
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to detect food. Check your API key.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Upload a food photo</Text>
      <Text style={styles.subtitle}>
        Take a photo or pick from gallery to identify the food and get the recipe.
      </Text>

      <View style={styles.buttons}>
        <Pressable style={styles.btn} onPress={() => pickImage(true)}>
          <Ionicons name="camera" size={24} color="#fff" />
          <Text style={styles.btnText}>Camera</Text>
        </Pressable>
        <Pressable style={styles.btn} onPress={() => pickImage(false)}>
          <Ionicons name="images" size={24} color="#fff" />
          <Text style={styles.btnText}>Gallery</Text>
        </Pressable>
      </View>

      {image && (
        <Image source={{ uri: image }} style={styles.preview} />
      )}

      {loading && (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#e67e22" />
          <Text style={styles.loadingText}>Detecting food...</Text>
        </View>
      )}

      {result && (
        <View style={styles.resultBox}>
          <Text style={styles.foodName}>{result.name}</Text>
          {result.description && (
            <Text style={styles.foodDesc}>{result.description}</Text>
          )}
          {result.ingredients && <IngredientsList ingredients={result.ingredients} />}
          {result.steps && <StepsList steps={result.steps} />}
        </View>
      )}
    </ScrollView>
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
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 20,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#e67e22',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  preview: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    marginBottom: 16,
  },
  loadingBox: {
    alignItems: 'center',
    marginTop: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#888',
  },
  resultBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  foodName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  foodDesc: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },
});
