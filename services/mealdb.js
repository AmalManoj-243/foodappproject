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
