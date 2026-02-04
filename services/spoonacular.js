// Spoonacular API - Free tier: 150 requests/day
// Get your API key at: https://spoonacular.com/food-api/console#Dashboard
const SPOONACULAR_API_KEY = 'YOUR_API_KEY_HERE'; // Replace with your key

const BASE_URL = 'https://api.spoonacular.com';

// Search recipes by ingredients
export async function findByIngredients(ingredients, number = 5) {
  const url = `${BASE_URL}/recipes/findByIngredients?ingredients=${encodeURIComponent(ingredients)}&number=${number}&ranking=2&ignorePantry=true&apiKey=${SPOONACULAR_API_KEY}`;

  const res = await fetch(url);
  if (!res.ok) {
    if (res.status === 402) {
      throw new Error('API limit reached. Try again tomorrow.');
    }
    throw new Error(`Spoonacular API error: ${res.status}`);
  }

  const data = await res.json();

  // Transform to our app's format
  return data.map((recipe, index) => ({
    id: String(recipe.id),
    name: recipe.title,
    description: `Uses ${recipe.usedIngredientCount} of your ingredients. Missing: ${recipe.missedIngredients.map(i => i.name).join(', ') || 'None'}`,
    image: recipe.image,
    difficulty: recipe.missedIngredientCount <= 2 ? 'Easy' : recipe.missedIngredientCount <= 4 ? 'Medium' : 'Hard',
    time: '30 mins', // Spoonacular doesn't return this in findByIngredients
    usedIngredients: recipe.usedIngredients.map(i => i.name),
    missedIngredients: recipe.missedIngredients.map(i => i.name),
    spoonacularId: recipe.id,
  }));
}

// Get full recipe details by ID
export async function getRecipeInfo(recipeId) {
  const url = `${BASE_URL}/recipes/${recipeId}/information?includeNutrition=false&apiKey=${SPOONACULAR_API_KEY}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Spoonacular API error: ${res.status}`);
  }

  const data = await res.json();

  // Transform to our app's format
  return {
    id: String(data.id),
    name: data.title,
    description: data.summary?.replace(/<[^>]*>/g, '').slice(0, 150) + '...' || '',
    country: data.cuisines?.[0] || 'International',
    image: data.image,
    time: `${data.readyInMinutes} mins`,
    servings: data.servings,
    ingredients: data.extendedIngredients?.map(ing => ({
      item: ing.name,
      qty: `${ing.amount} ${ing.unit}`,
    })) || [],
    steps: data.analyzedInstructions?.[0]?.steps?.map(s => s.step) ||
           (data.instructions ? [data.instructions.replace(/<[^>]*>/g, '')] : ['No instructions available']),
    sourceUrl: data.sourceUrl,
    spoonacularId: data.id,
  };
}

// Check if API key is configured
export function isConfigured() {
  return SPOONACULAR_API_KEY !== 'YOUR_API_KEY_HERE' && SPOONACULAR_API_KEY.length > 10;
}
