import { useLocalSearchParams, Stack } from 'expo-router';
import { useState, useEffect } from 'react';
import { ScrollView, Image, Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import foods from '../../data/foods';
import { getMealById } from '../../services/mealdb';
import { IngredientsList, StepsList } from '../../components/RecipeSection';

export default function RecipeDetail() {
  const { id } = useLocalSearchParams();
  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local data first
    const local = foods.find((f) => f.id === id);
    if (local) {
      setFood(local);
      setLoading(false);
      return;
    }
    // Otherwise fetch from TheMealDB
    getMealById(id)
      .then((meal) => setFood(meal))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <Stack.Screen options={{ title: 'Loading...' }} />
        <ActivityIndicator size="large" color="#e67e22" />
      </View>
    );
  }

  if (!food) {
    return (
      <View style={styles.center}>
        <Stack.Screen options={{ title: 'Not Found' }} />
        <Text>Recipe not found.</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: food.name }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {food.image ? (
          <Image source={{ uri: food.image }} style={styles.image} />
        ) : null}
        <View style={styles.body}>
          <Text style={styles.name}>{food.name}</Text>
          {food.country && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{food.country}</Text>
            </View>
          )}
          {food.description ? (
            <Text style={styles.description}>{food.description}</Text>
          ) : null}
          {food.ingredients && <IngredientsList ingredients={food.ingredients} />}
          {food.steps && <StepsList steps={food.steps} />}
        </View>
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
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 250,
  },
  body: {
    padding: 16,
  },
  name: {
    fontSize: 26,
    fontWeight: '700',
    color: '#333',
  },
  badge: {
    backgroundColor: '#e67e22',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
  },
  badgeText: {
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
});
