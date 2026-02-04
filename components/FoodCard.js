import { View, Text, Image, ImageBackground, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

export default function FoodCard({ food }) {
  const router = useRouter();

  return (
    <Pressable
      style={styles.card}
      onPress={() => router.push(`/recipe/${food.id}`)}
    >
      <Image source={{ uri: food.image }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{food.name}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {food.description}
        </Text>
      </View>
    </Pressable>
  );
}

export function TrendingCard({ food, fullWidth }) {
  const router = useRouter();

  return (
    <Pressable
      style={[styles.trendingCard, fullWidth && styles.trendingCardFull]}
      onPress={() => router.push(`/recipe/${food.id}`)}
    >
      <ImageBackground
        source={{ uri: food.image }}
        style={styles.trendingImage}
        imageStyle={{ borderRadius: 12 }}
      >
        <View style={styles.trendingOverlay}>
          <Text style={styles.trendingName}>{food.name}</Text>
          <Text style={styles.trendingCountry}>{food.country}</Text>
        </View>
      </ImageBackground>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: 180,
  },
  info: {
    padding: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  description: {
    fontSize: 13,
    color: '#777',
    marginTop: 4,
  },
  trendingCard: {
    width: 160,
    height: 200,
    marginRight: 12,
  },
  trendingCardFull: {
    width: '100%',
    height: 220,
    marginRight: 0,
  },
  trendingImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  trendingOverlay: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    padding: 10,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  trendingName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  trendingCountry: {
    color: '#ddd',
    fontSize: 12,
    marginTop: 2,
  },
});
