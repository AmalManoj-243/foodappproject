const BASE = 'https://www.themealdb.com/api/json/v1/1';

function formatMeal(meal) {
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const item = meal[`strIngredient${i}`]?.trim();
    const qty = meal[`strMeasure${i}`]?.trim();
    if (item) ingredients.push({ item, qty: qty || '' });
  }
  const steps = meal.strInstructions
    ? meal.strInstructions
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
    : [];

  return {
    id: meal.idMeal,
    name: meal.strMeal,
    image: meal.strMealThumb,
    description: `${meal.strArea} ${meal.strCategory}`,
    country: meal.strArea,
    category: meal.strCategory,
    ingredients,
    steps,
  };
}

export async function searchMeals(query) {
  const res = await fetch(`${BASE}/search.php?s=${encodeURIComponent(query)}`);
  const data = await res.json();
  if (!data.meals) return [];
  return data.meals.map(formatMeal);
}

export async function getMealById(id) {
  const res = await fetch(`${BASE}/lookup.php?i=${id}`);
  const data = await res.json();
  if (!data.meals?.[0]) return null;
  return formatMeal(data.meals[0]);
}

export async function getMealsByCountry(area) {
  const res = await fetch(`${BASE}/filter.php?a=${encodeURIComponent(area)}`);
  const data = await res.json();
  if (!data.meals) return [];
  return data.meals.map((m) => ({
    id: m.idMeal,
    name: m.strMeal,
    image: m.strMealThumb,
    description: '',
    country: area,
  }));
}

export async function getRandomMeals(count = 5) {
  const meals = [];
  for (let i = 0; i < count; i++) {
    const res = await fetch(`${BASE}/random.php`);
    const data = await res.json();
    if (data.meals?.[0]) meals.push(formatMeal(data.meals[0]));
  }
  return meals;
}

export async function getCategories() {
  const res = await fetch(`${BASE}/categories.php`);
  const data = await res.json();
  return data.categories || [];
}

// Country areas available in TheMealDB
export const AREAS = [
  'Indian', 'Italian', 'Mexican', 'Japanese', 'Thai',
  'American', 'French', 'Chinese', 'British', 'Canadian',
  'Croatian', 'Dutch', 'Egyptian', 'Greek', 'Irish',
  'Jamaican', 'Kenyan', 'Malaysian', 'Moroccan', 'Polish',
  'Portuguese', 'Russian', 'Spanish', 'Turkish', 'Vietnamese',
];

// Search by main ingredient (FREE - no API key needed!)
export async function filterByIngredient(ingredient) {
  const res = await fetch(`${BASE}/filter.php?i=${encodeURIComponent(ingredient)}`);
  const data = await res.json();
  if (!data.meals) return [];
  return data.meals.map((m) => ({
    id: m.idMeal,
    name: m.strMeal,
    image: m.strMealThumb,
  }));
}

// Search by multiple ingredients - returns meals that match ANY ingredient
export async function searchByIngredients(ingredientList) {
  // Split ingredients and search for each
  const ingredients = ingredientList.split(',').map(i => i.trim().toLowerCase()).filter(i => i);
  if (ingredients.length === 0) return [];

  const allMeals = new Map();
  const mealScores = new Map();

  // Search for each ingredient
  for (const ingredient of ingredients.slice(0, 3)) { // Limit to first 3 to avoid too many requests
    try {
      const meals = await filterByIngredient(ingredient);
      for (const meal of meals) {
        if (!allMeals.has(meal.id)) {
          allMeals.set(meal.id, meal);
          mealScores.set(meal.id, 1);
        } else {
          mealScores.set(meal.id, mealScores.get(meal.id) + 1);
        }
      }
    } catch (e) {
      console.log(`Failed to search for ${ingredient}`);
    }
  }

  // Sort by score (meals matching more ingredients first)
  const sortedMeals = Array.from(allMeals.values())
    .sort((a, b) => mealScores.get(b.id) - mealScores.get(a.id))
    .slice(0, 8);

  // Fetch details for top meals to get more info
  const detailedMeals = [];
  for (const meal of sortedMeals.slice(0, 5)) {
    try {
      const details = await getMealById(meal.id);
      if (details) {
        detailedMeals.push({
          id: details.id,
          name: details.name,
          description: details.description,
          image: details.image,
          difficulty: details.ingredients.length <= 8 ? 'Easy' : details.ingredients.length <= 12 ? 'Medium' : 'Hard',
          time: details.ingredients.length <= 6 ? '20 mins' : details.ingredients.length <= 10 ? '35 mins' : '50 mins',
          country: details.country,
          matchScore: mealScores.get(meal.id),
        });
      }
    } catch (e) {
      // Skip if failed to get details
    }
  }

  return detailedMeals;
}
