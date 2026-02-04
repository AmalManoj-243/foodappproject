import { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Image,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import foods from '../../data/foods';
import { TrendingCard } from '../../components/FoodCard';

import { searchMeals, getMealsByCountry, AREAS } from '../../services/mealdb';
import { searchRecipe, getRecipesByIngredients, getRecipeDetails } from '../../services/gemini';

const YOUTUBE_VIDEOS = [
  {
    id: '1',
    title: 'Gordon Ramsay\'s Ultimate Cookery Course',
    thumbnail: 'https://i.ytimg.com/vi/ZJy1ajvMU1k/hqdefault.jpg',
    url: 'https://www.youtube.com/watch?v=ZJy1ajvMU1k',
    channel: 'Gordon Ramsay',
  },
  {
    id: '2',
    title: 'Perfect Pasta - Italian Chef Secrets',
    thumbnail: 'https://i.ytimg.com/vi/bJUiWdM__Qw/hqdefault.jpg',
    url: 'https://www.youtube.com/watch?v=bJUiWdM__Qw',
    channel: 'Italia Squisita',
  },
  {
    id: '3',
    title: '15 Mistakes Most Beginner Cooks Make',
    thumbnail: 'https://i.ytimg.com/vi/TF0gBRcbp1g/hqdefault.jpg',
    url: 'https://www.youtube.com/watch?v=TF0gBRcbp1g',
    channel: 'Joshua Weissman',
  },
  {
    id: '4',
    title: 'Indian Butter Chicken Recipe',
    thumbnail: 'https://i.ytimg.com/vi/a03U45jFxOI/hqdefault.jpg',
    url: 'https://www.youtube.com/watch?v=a03U45jFxOI',
    channel: 'Get Curried',
  },
  {
    id: '5',
    title: 'Japanese Street Food Tour',
    thumbnail: 'https://i.ytimg.com/vi/6a8cLZ6PGxQ/hqdefault.jpg',
    url: 'https://www.youtube.com/watch?v=6a8cLZ6PGxQ',
    channel: 'Best Ever Food Review',
  },
];


export default function HomeScreen() {
  const router = useRouter();
  const [foodSearch, setFoodSearch] = useState('');
  const [countrySearch, setCountrySearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(null);

  const trendingFoods = useMemo(() => foods.filter((f) => f.trending), []);

  // Ingredients-based search
  const [ingredients, setIngredients] = useState('');
  const [ingredientResults, setIngredientResults] = useState([]);
  const [ingredientLoading, setIngredientLoading] = useState(false);
  const [ingredientError, setIngredientError] = useState('');
  const [loadingDish, setLoadingDish] = useState(null);

  const handleIngredientSearch = async () => {
    const q = ingredients.trim();
    if (!q) return;
    setIngredientLoading(true);
    setIngredientResults([]);
    setIngredientError('');
    try {
      const results = await getRecipesByIngredients(q);
      setIngredientResults(results);
    } catch (e) {
      setIngredientError(e.message || 'Failed to get suggestions');
    }
    setIngredientLoading(false);
  };

  const handleIngredientDishPress = async (dish) => {
    setLoadingDish(dish.id);
    setIngredientError('');
    try {
      const recipe = await getRecipeDetails(dish.name);
      router.push({
        pathname: '/recipe/ai',
        params: { data: JSON.stringify(recipe) },
      });
    } catch (e) {
      setIngredientError('Failed to load recipe details');
    }
    setLoadingDish(null);
  };

  // Search
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchStatus, setSearchStatus] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [aiResult, setAiResult] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const [searchError, setSearchError] = useState('');

  const handleFoodSearch = async () => {
    const q = foodSearch.trim();
    if (!q) return;
    setSearchLoading(true);
    setSearchResults([]);
    setAiResult(null);
    setHasSearched(true);
    setSearchError('');
    setSearchStatus('Searching database...');
    try {
      const results = await searchMeals(q);
      if (results.length > 0) {
        setSearchResults(results);
        setSearchLoading(false);
        setSearchStatus('');
        return;
      }
    } catch (_) {}
    // MealDB had no results, fall back to Gemini AI
    setSearchStatus('Not in database. Asking AI...');
    try {
      const recipe = await searchRecipe(q);
      if (recipe) {
        setAiResult(recipe);
      }
    } catch (e) {
      setSearchError(e.message || 'AI search failed');
    }
    setSearchLoading(false);
    setSearchStatus('');
  };

  // Country foods from MealDB
  const [countryFoods, setCountryFoods] = useState([]);
  const [countryLoading, setCountryLoading] = useState(false);

  const handleCountrySelect = async (area) => {
    if (selectedCountry === area) {
      setSelectedCountry(null);
      setCountryFoods([]);
      return;
    }
    setSelectedCountry(area);
    setCountryLoading(true);
    setCountryFoods([]);
    try {
      const list = await getMealsByCountry(area);
      setCountryFoods(list);
    } catch (_) {}
    setCountryLoading(false);
  };

  const filteredAreas = useMemo(() => {
    if (!countrySearch.trim()) return AREAS;
    const q = countrySearch.toLowerCase();
    return AREAS.filter((a) => a.toLowerCase().includes(q));
  }, [countrySearch]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* ---- TRENDING ---- */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="flame" size={22} color="#e67e22" />
          <Text style={styles.sectionTitle}>Trending Foods</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.trendingRow}
        >
          {trendingFoods.map((item) => (
            <TrendingCard key={item.id} food={item} />
          ))}
        </ScrollView>
      </View>

      {/* ---- COOK WITH INGREDIENTS ---- */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="restaurant" size={20} color="#e67e22" />
          <Text style={styles.sectionTitle}>What Can I Cook?</Text>
        </View>
        <Text style={styles.sectionSubtitle}>Enter ingredients you have and get dish ideas</Text>
        <View style={styles.searchBox}>
          <Ionicons name="leaf-outline" size={18} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="e.g. chicken, tomato, garlic, rice..."
            placeholderTextColor="#999"
            value={ingredients}
            onChangeText={setIngredients}
            onSubmitEditing={handleIngredientSearch}
            returnKeyType="search"
          />
          {ingredients.length > 0 && (
            <Pressable onPress={() => { setIngredients(''); setIngredientResults([]); setIngredientError(''); }}>
              <Ionicons name="close-circle" size={18} color="#999" />
            </Pressable>
          )}
        </View>
        <Pressable style={styles.searchBtn} onPress={handleIngredientSearch}>
          <Ionicons name="bulb" size={18} color="#fff" />
          <Text style={styles.searchBtnText}>Get Suggestions</Text>
        </Pressable>

        {ingredientLoading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#e67e22" />
            <Text style={styles.loadingText}>Finding recipes for you...</Text>
          </View>
        )}

        {ingredientError ? (
          <Text style={styles.noResults}>{ingredientError}</Text>
        ) : null}

        {ingredientResults.length > 0 && (
          <View style={styles.ingredientResults}>
            {ingredientResults.map((dish) => (
              <Pressable
                key={dish.id}
                style={[styles.ingredientCard, loadingDish === dish.id && styles.ingredientCardLoading]}
                onPress={() => handleIngredientDishPress(dish)}
                disabled={loadingDish !== null}
              >
                <View style={styles.ingredientCardLeft}>
                  <Text style={styles.ingredientDishName}>{dish.name}</Text>
                  <Text style={styles.ingredientDishDesc} numberOfLines={2}>{dish.description}</Text>
                  <View style={styles.ingredientMeta}>
                    <View style={styles.metaTag}>
                      <Ionicons name="time-outline" size={12} color="#666" />
                      <Text style={styles.metaText}>{dish.time}</Text>
                    </View>
                    <View style={[styles.metaTag, dish.difficulty === 'Easy' && styles.metaTagEasy, dish.difficulty === 'Hard' && styles.metaTagHard]}>
                      <Text style={styles.metaText}>{dish.difficulty}</Text>
                    </View>
                  </View>
                </View>
                {loadingDish === dish.id ? (
                  <ActivityIndicator size="small" color="#e67e22" />
                ) : (
                  <Ionicons name="chevron-forward" size={20} color="#ccc" />
                )}
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/* ---- YOUTUBE VIDEOS ---- */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="logo-youtube" size={22} color="#FF0000" />
          <Text style={styles.sectionTitle}>Cooking Videos</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.videoRow}
        >
          {YOUTUBE_VIDEOS.map((video) => (
            <Pressable
              key={video.id}
              style={styles.videoCard}
              onPress={() => Linking.openURL(video.url)}
            >
              <Image source={{ uri: video.thumbnail }} style={styles.videoThumbnail} />
              <View style={styles.playButton}>
                <Ionicons name="play" size={24} color="#fff" />
              </View>
              <View style={styles.videoInfo}>
                <Text style={styles.videoTitle} numberOfLines={2}>{video.title}</Text>
                <Text style={styles.videoChannel}>{video.channel}</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* ---- SEARCH FOODS ---- */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="search" size={20} color="#e67e22" />
          <Text style={styles.sectionTitle}>Search Recipes</Text>
        </View>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search any food (chicken, pasta, cake...)"
            placeholderTextColor="#999"
            value={foodSearch}
            onChangeText={setFoodSearch}
            onSubmitEditing={handleFoodSearch}
            returnKeyType="search"
          />
          {foodSearch.length > 0 && (
            <Pressable onPress={() => { setFoodSearch(''); setSearchResults([]); setAiResult(null); setHasSearched(false); }}>
              <Ionicons name="close-circle" size={18} color="#999" />
            </Pressable>
          )}
        </View>
        <Pressable style={styles.searchBtn} onPress={handleFoodSearch}>
          <Ionicons name="search" size={18} color="#fff" />
          <Text style={styles.searchBtnText}>Search</Text>
        </Pressable>

        {searchLoading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#e67e22" />
            {searchStatus ? <Text style={styles.loadingText}>{searchStatus}</Text> : null}
          </View>
        )}

        {searchResults.length > 0 && (
          <View style={styles.searchResults}>
            {searchResults.map((meal) => (
              <Pressable
                key={meal.id}
                style={styles.mealCard}
                onPress={() => router.push(`/recipe/${meal.id}`)}
              >
                <Image source={{ uri: meal.image }} style={styles.mealImage} />
                <View style={styles.mealInfo}>
                  <Text style={styles.mealName}>{meal.name}</Text>
                  <Text style={styles.mealDesc}>{meal.country} - {meal.category}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </Pressable>
            ))}
          </View>
        )}

        {aiResult && (
          <Pressable
            style={styles.aiCard}
            onPress={() =>
              router.push({
                pathname: '/recipe/ai',
                params: { data: JSON.stringify(aiResult) },
              })
            }
          >
            <Ionicons name="sparkles" size={20} color="#e67e22" />
            <View style={styles.mealInfo}>
              <Text style={styles.mealName}>{aiResult.name}</Text>
              <Text style={styles.mealDesc}>{aiResult.description}</Text>
              <Text style={styles.aiHint}>Generated by AI - Tap to view recipe</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </Pressable>
        )}

        {!searchLoading && hasSearched && searchResults.length === 0 && !aiResult && (
          <Text style={styles.noResults}>
            {searchError ? `AI error: ${searchError}` : 'No results found. Try another keyword.'}
          </Text>
        )}
      </View>

      {/* ---- BROWSE BY COUNTRY ---- */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="globe" size={20} color="#e67e22" />
          <Text style={styles.sectionTitle}>Browse by Country</Text>
        </View>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search countries..."
            placeholderTextColor="#999"
            value={countrySearch}
            onChangeText={(text) => {
              setCountrySearch(text);
              setSelectedCountry(null);
              setCountryFoods([]);
            }}
          />
          {countrySearch.length > 0 && (
            <Pressable onPress={() => { setCountrySearch(''); setSelectedCountry(null); setCountryFoods([]); }}>
              <Ionicons name="close-circle" size={18} color="#999" />
            </Pressable>
          )}
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.countryRow}
        >
          {filteredAreas.map((area) => (
            <Pressable
              key={area}
              style={[
                styles.countryChip,
                selectedCountry === area && styles.countryChipActive,
              ]}
              onPress={() => handleCountrySelect(area)}
            >
              <Text
                style={[
                  styles.countryName,
                  selectedCountry === area && styles.countryNameActive,
                ]}
              >
                {area}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {countryLoading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#e67e22" />
          </View>
        )}

        {selectedCountry && !countryLoading && countryFoods.length > 0 && (
          <View style={styles.countryResults}>
            <Text style={styles.countryResultsTitle}>
              {selectedCountry} Recipes ({countryFoods.length})
            </Text>
            {countryFoods.map((food) => (
              <Pressable
                key={food.id}
                style={styles.mealCard}
                onPress={() => router.push(`/recipe/${food.id}`)}
              >
                <Image source={{ uri: food.image }} style={styles.mealImage} />
                <View style={styles.mealInfo}>
                  <Text style={styles.mealName}>{food.name}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  trendingRow: {
    paddingRight: 16,
    gap: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    padding: 0,
  },
  searchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#e67e22',
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 10,
  },
  searchBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingBox: {
    alignItems: 'center',
    marginTop: 20,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 13,
    color: '#888',
  },
  searchResults: {
    marginTop: 12,
  },
  noResults: {
    textAlign: 'center',
    color: '#999',
    marginTop: 16,
    fontSize: 14,
  },
  mealCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  mealImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  mealInfo: {
    flex: 1,
    marginLeft: 12,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  mealDesc: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  countryRow: {
    marginTop: 12,
    paddingRight: 16,
    gap: 10,
  },
  countryChip: {
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
  },
  countryChipActive: {
    backgroundColor: '#e67e22',
    borderColor: '#e67e22',
  },
  countryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
  },
  countryNameActive: {
    color: '#fff',
  },
  countryResults: {
    marginTop: 16,
  },
  countryResultsTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#555',
    marginBottom: 12,
  },
  aiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff8f0',
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#e67e22',
  },
  aiHint: {
    fontSize: 11,
    color: '#e67e22',
    marginTop: 4,
    fontWeight: '600',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#888',
    marginBottom: 12,
    marginTop: -8,
  },
  ingredientResults: {
    marginTop: 12,
  },
  ingredientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  ingredientCardLoading: {
    backgroundColor: '#fff8f0',
    borderWidth: 1,
    borderColor: '#e67e22',
  },
  ingredientCardLeft: {
    flex: 1,
  },
  ingredientDishName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  ingredientDishDesc: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  ingredientMeta: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  metaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  metaTagEasy: {
    backgroundColor: '#d4edda',
  },
  metaTagHard: {
    backgroundColor: '#f8d7da',
  },
  metaText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  videoRow: {
    paddingRight: 16,
    gap: 12,
  },
  videoCard: {
    width: 200,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  videoThumbnail: {
    width: '100%',
    height: 112,
    backgroundColor: '#ddd',
  },
  playButton: {
    position: 'absolute',
    top: 40,
    left: 80,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoInfo: {
    padding: 10,
  },
  videoTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  videoChannel: {
    fontSize: 11,
    color: '#888',
    marginTop: 4,
  },
});
