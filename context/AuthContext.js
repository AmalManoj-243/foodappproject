import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, getUserData, logIn, logOut, signUp } from '../services/firebase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Fetch user data from Firestore
        const data = await getUserData(firebaseUser.uid);
        setUserData(data);
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    const firebaseUser = await logIn(email, password);
    const data = await getUserData(firebaseUser.uid);
    setUserData(data);
    return firebaseUser;
  };

  const signup = async (email, password, name) => {
    const firebaseUser = await signUp(email, password, name);
    const data = await getUserData(firebaseUser.uid);
    setUserData(data);
    return firebaseUser;
  };

  const logout = async () => {
    await logOut();
    setUser(null);
    setUserData(null);
  };

  const refreshUserData = async () => {
    if (user) {
      const data = await getUserData(user.uid);
      setUserData(data);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      userData,
      loading,
      login,
      signup,
      logout,
      refreshUserData,
      isLoggedIn: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
