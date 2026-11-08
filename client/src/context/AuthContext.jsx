import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "../firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  const signup = async (name, email, password) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    return cred.user;
  };

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);
  const logout = () => signOut(auth);
  const getToken = () => auth.currentUser?.getIdToken();

  return (
    <AuthContext.Provider
      value={{ user, loading, signup, login, logout, getToken }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
