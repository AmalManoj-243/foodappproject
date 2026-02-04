// Add multiple API keys here to avoid rate limits.
// Go to https://aistudio.google.com/apikey and create more keys.
const API_KEYS = [
  'AIzaSyAe3VexnXuRcx1U_Jwom91HoO0BD_qKyXo',
  'AIzaSyAgJgCCwqK4-iHG6gsl15-IxiXWEYBhw0I',
];

let currentKeyIndex = 0;

function getApiUrl() {
  const key = API_KEYS[currentKeyIndex % API_KEYS.length];
  return `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${key}`;
}

function rotateKey() {
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
}

function parseJSON(text) {
  const match = text.match(/\[[\s\S]*\]/) || text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Could not parse response');
  return JSON.parse(match[0]);
}

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function callGemini(prompt, retries = 4) {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(getApiUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });
    if (res.status === 429) {
      rotateKey();
      await delay(3000 * (i + 1));
      continue;
    }
    if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('No response from Gemini');
    return text;
  }
  throw new Error('Rate limited. Please wait 30 seconds and try again.');
}

export async function detectFood(base64Image) {
  const res = await fetch(getApiUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: 'Identify the food in this image. Return a JSON object with exactly this structure: {"name": "food name", "description": "brief description", "ingredients": [{"item": "ingredient name", "qty": "quantity"}], "steps": ["step 1", "step 2"]}. Return ONLY the JSON, no markdown or extra text.' },
          { inline_data: { mime_type: 'image/jpeg', data: base64Image } },
        ],
      }],
    }),
  });
  if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('No response from Gemini');
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Could not parse food data');
  return JSON.parse(match[0]);
}

export async function searchRecipe(query) {
  const text = await callGemini(
    `Give me a detailed recipe for "${query}". Return a JSON object: {"name": "food name", "description": "brief description", "country": "country of origin", "image": "", "ingredients": [{"item": "name", "qty": "quantity"}], "steps": ["step 1", "step 2"]}. Return ONLY JSON.`
  );
  return parseJSON(text);
}

export async function getFoodsByCountry(country) {
  const text = await callGemini(
    `List 6 popular traditional foods from ${country}. Return a JSON array: [{"id": "1", "name": "food name", "description": "one line description", "country": "${country}", "image": ""}]. Return ONLY the JSON array.`
  );
  return parseJSON(text);
}

export async function getRecipesByIngredients(ingredients) {
  const text = await callGemini(
    `I have these ingredients: ${ingredients}. Suggest 5 dishes I can make with these ingredients. Return a JSON array: [{"id": "1", "name": "dish name", "description": "brief description of the dish", "difficulty": "Easy/Medium/Hard", "time": "cooking time like 30 mins"}]. Return ONLY the JSON array.`
  );
  return parseJSON(text);
}

export async function getRecipeDetails(dishName) {
  const text = await callGemini(
    `Give me a detailed recipe for "${dishName}". Return a JSON object: {"name": "food name", "description": "brief description", "country": "country of origin", "image": "", "ingredients": [{"item": "name", "qty": "quantity"}], "steps": ["step 1", "step 2"]}. Return ONLY JSON.`
  );
  return parseJSON(text);
}
