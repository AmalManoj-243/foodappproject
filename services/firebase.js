import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCBY15VzQwDr53IwLicpqpqm3QuFO0Onco",
  authDomain: "foodapp-818c9.firebaseapp.com",
  projectId: "foodapp-818c9",
  storageBucket: "foodapp-818c9.firebasestorage.app",
  messagingSenderId: "481668360796",
  appId: "1:481668360796:android:9515a0e4c2990fa9371499"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Auth functions
export async function signUp(email, password, name) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Create user document in Firestore
  await setDoc(doc(db, 'users', user.uid), {
    name: name,
    email: email,
    favorites: [],
    shoppingList: [],
    createdAt: new Date().toISOString()
  });

  return user;
}

export async function logIn(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

export async function logOut() {
  await signOut(auth);
}

// Firestore functions for user data
export async function getUserData(userId) {
  const docRef = doc(db, 'users', userId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data();
  }
  return null;
}

export async function addToFavorites(userId, recipe) {
  const docRef = doc(db, 'users', userId);
  await updateDoc(docRef, {
    favorites: arrayUnion(recipe)
  });
}

export async function removeFromFavorites(userId, recipeId) {
  const docRef = doc(db, 'users', userId);
  const userData = await getUserData(userId);
  const updatedFavorites = userData.favorites.filter(r => r.id !== recipeId);
  await updateDoc(docRef, {
    favorites: updatedFavorites
  });
}

export async function addToShoppingList(userId, items) {
  const docRef = doc(db, 'users', userId);
  await updateDoc(docRef, {
    shoppingList: arrayUnion(...items)
  });
}

export async function removeFromShoppingList(userId, item) {
  const docRef = doc(db, 'users', userId);
  await updateDoc(docRef, {
    shoppingList: arrayRemove(item)
  });
}

export async function clearShoppingList(userId) {
  const docRef = doc(db, 'users', userId);
  await updateDoc(docRef, {
    shoppingList: []
  });
}
