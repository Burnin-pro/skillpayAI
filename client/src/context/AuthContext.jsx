import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { auth } from '../services/firebase';
import { onIdTokenChanged, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { apiClient } from '../services/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const cached = localStorage.getItem('skillpay_user');
      if (!cached) return null;
      const parsed = JSON.parse(cached);
      const uid = parsed.uid || parsed.id;

      const savedPhoto = (uid ? localStorage.getItem('skillpay_user_photo_' + uid) : null) || 
                         localStorage.getItem('skillpay_user_photo_global') || 
                         parsed.photoURL || 
                         parsed.avatar;
      return {
        ...parsed,
        photoURL: savedPhoto,
        avatar: savedPhoto
      };
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  const isMock = import.meta.env.VITE_USE_MOCK === 'true';

  useEffect(() => {
    if (isMock) {
      api.getMe().then(u => {
        setUser(u);
        try { localStorage.setItem('skillpay_user', JSON.stringify(u)); } catch {}
        setLoading(false);
      });
      return;
    }

    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const uid = firebaseUser.uid;

        // 1. Check if we already have a verified cached user for this exact UID
        let cachedUser = null;
        try {
          const cached = localStorage.getItem('skillpay_user');
          if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed.uid === uid || parsed.id === uid) {
              cachedUser = parsed;
            }
          }
        } catch {}

        if (cachedUser && cachedUser.role) {
          const savedPhoto = localStorage.getItem('skillpay_user_photo_' + uid) || 
                             localStorage.getItem('skillpay_user_photo_global') || 
                             cachedUser.photoURL || 
                             cachedUser.avatar;
          const immediateUser = {
            ...cachedUser,
            photoURL: savedPhoto,
            avatar: savedPhoto
          };
          setUser(immediateUser);
          setLoading(false);
        } else {
          setLoading(true);
        }

        // 2. Fetch full verified profile from backend to resolve true role
        try {
          const profile = await apiClient.get('/auth/me');
          // Database profile role is the absolute single source of truth
          const realRole = profile?.role || cachedUser?.role || localStorage.getItem('skillpay_user_role') || 'customer';

          const savedPhoto = localStorage.getItem('skillpay_user_photo_' + uid) || 
                             localStorage.getItem('skillpay_user_photo_global') || 
                             profile?.photoURL || 
                             profile?.avatar;

          const fullUser = { 
            uid,
            id: uid,
            email: firebaseUser.email,
            name: profile?.name || firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'User'),
            ...profile,
            photoURL: savedPhoto,
            avatar: savedPhoto,
            role: realRole
          };

          setUser(fullUser);
          try { 
            localStorage.setItem('skillpay_user', JSON.stringify(fullUser));
            localStorage.setItem('skillpay_user_role', realRole);
            if (savedPhoto) {
              localStorage.setItem('skillpay_user_photo_' + uid, savedPhoto);
              localStorage.setItem('skillpay_user_photo_global', savedPhoto);
            }
          } catch {}
        } catch (error) {
          console.warn("Profile fetch notice:", error);
          const fallbackRole = cachedUser?.role || localStorage.getItem('skillpay_user_role') || 'customer';
          const fallbackUser = {
            uid,
            id: uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'User'),
            role: fallbackRole
          };
          setUser(fallbackUser);
          try {
            localStorage.setItem('skillpay_user', JSON.stringify(fallbackUser));
            localStorage.setItem('skillpay_user_role', fallbackRole);
          } catch {}
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
        try { 
          localStorage.removeItem('skillpay_user');
          localStorage.removeItem('skillpay_user_role');
        } catch {}
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [isMock]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);

      let profileData = null;
      try {
        profileData = await apiClient.get('/auth/me');
      } catch (err) {
        console.warn("Could not fetch profile during login:", err);
      }

      // Role strictly from database record
      const role = profileData?.role || 'customer';

      const fullUser = {
        uid: cred.user.uid,
        id: cred.user.uid,
        email: cred.user.email,
        name: profileData?.name || cred.user.displayName || (cred.user.email ? cred.user.email.split('@')[0] : 'User'),
        role: role,
        ...(profileData || {})
      };

      setUser(fullUser);
      try {
        localStorage.setItem('skillpay_user', JSON.stringify(fullUser));
        localStorage.setItem('skillpay_user_role', role);
      } catch {}

      return fullUser;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);

      let profileData = null;
      try {
        profileData = await apiClient.get('/auth/me');
      } catch (err) {
        console.warn("Could not fetch profile during Google login:", err);
      }

      const role = profileData?.role || localStorage.getItem('skillpay_user_role') || 'customer';

      const fullUser = {
        uid: cred.user.uid,
        id: cred.user.uid,
        email: cred.user.email,
        name: profileData?.name || cred.user.displayName || (cred.user.email ? cred.user.email.split('@')[0] : 'User'),
        role: role,
        ...(profileData || {})
      };

      setUser(fullUser);
      try {
        localStorage.setItem('skillpay_user', JSON.stringify(fullUser));
        localStorage.setItem('skillpay_user_role', role);
      } catch {}

      return fullUser;
    } finally {
      setLoading(false);
    }
  };

  const setUserRole = (role) => {
    try { localStorage.setItem('skillpay_user_role', role); } catch {}
    setUser(prev => prev ? { ...prev, role } : prev);
  };

  const loginDemo = async (role) => {
    if (isMock) {
      setLoading(true);
      const u = await api.loginDemo(role);
      setUser(u);
      setLoading(false);
      return;
    }
    
    // Real login with seeded demo accounts
    let email = `demo-${role}@skillpay.demo`;
    if (role === 'admin') email = 'admin@skillpay.demo';
    
    try {
      await login(email, 'demo1234');
    } catch (error) {
      console.error('Demo login failed', error);
      alert('Demo login failed. Ensure emulators and seed data are running.');
    }
  };

  const updateUserProfilePhoto = async (photoUrl) => {
    if (!photoUrl) return;
    const uid = user?.uid || user?.id || 'current_user';
    try {
      localStorage.setItem('skillpay_user_photo_' + uid, photoUrl);
      localStorage.setItem('skillpay_user_photo_global', photoUrl);
      const stored = JSON.parse(localStorage.getItem('skillpay_user') || '{}');
      const updated = { ...stored, photoURL: photoUrl, avatar: photoUrl };
      localStorage.setItem('skillpay_user', JSON.stringify(updated));
    } catch (e) {
      console.warn("Storage sync error:", e);
    }
    setUser(prev => prev ? { ...prev, photoURL: photoUrl, avatar: photoUrl } : prev);
    try {
      await apiClient.put('/auth/me', { photoURL: photoUrl, avatar: photoUrl });
    } catch (err) {
      console.debug("Backend photo save notice:", err?.message);
    }
  };

  const logout = async () => {
    setUser(null);
    try { 
      localStorage.removeItem('skillpay_user');
      localStorage.removeItem('skillpay_user_role');
      localStorage.removeItem('skillpay_provider_profile');
      localStorage.removeItem('skillpay_provider_profile_provider_muthu');
      localStorage.removeItem('skillpay_active_project');
      localStorage.removeItem('skillpay_has_paid_order');
      localStorage.removeItem('skillpay_deal_demo');
      localStorage.removeItem('skillpay_deal_neg_demo');
    } catch {}
    if (isMock) {
      await api.logout();
      return;
    }
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, loginWithGoogle, loginDemo, logout, setUserRole, updateUserProfilePhoto }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
