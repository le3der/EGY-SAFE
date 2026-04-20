import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, getMultiFactorResolver, MultiFactorResolver, TotpMultiFactorGenerator, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, sendEmailVerification } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { logUserAction } from '../lib/audit';
import toast from 'react-hot-toast';

export type UserRole = 'Admin' | 'Analyst' | 'Viewer';

interface UserProfile {
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  mfaResolver: MultiFactorResolver | null;
  cancelMfaLogin: () => void;
  verifyMfa: (code: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  sendMagicLink: (email: string) => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  mfaResolver: null,
  cancelMfaLogin: () => {},
  verifyMfa: async () => {},
  signInWithGoogle: async () => {},
  sendMagicLink: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  resetPassword: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mfaResolver, setMfaResolver] = useState<MultiFactorResolver | null>(null);

  useEffect(() => {
    // Handle Magic Link sign-in
    const verifyMagicLink = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        let email = window.localStorage.getItem('emailForSignIn');
        if (!email) {
          email = window.prompt('Please provide your email for confirmation');
        }
        if (email) {
          try {
            await signInWithEmailLink(auth, email, window.location.href);
            window.localStorage.removeItem('emailForSignIn');
            window.history.replaceState(null, '', window.location.pathname);
            toast.success('Successfully authenticated via Magic Link');
            await logUserAction('User Login', 'User authenticated via Email Magic Link');
          } catch (error: any) {
            if (error.code === 'auth/multi-factor-auth-required') {
              const resolver = getMultiFactorResolver(auth, error);
              setMfaResolver(resolver);
            } else {
              toast.error('Magic Link Login failed: ' + error.message);
            }
          }
        }
      }
    };
    verifyMagicLink();

    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (currentUser) {
        const docRef = doc(db, 'users', currentUser.uid);
        
        unsubscribeProfile = onSnapshot(docRef, async (docSnap) => {
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
            setLoading(false);
          } else {
            // Self-register with Viewer role (or Admin if bootstrapped admin email)
            const isBootstrappedAdmin = currentUser.email === 'moashrafsy@gmail.com' && currentUser.emailVerified;
            const newProfile: UserProfile = {
              email: currentUser.email || '',
              role: isBootstrappedAdmin ? 'Admin' : 'Viewer',
            };
            
            // Set optimistically locally
            setProfile(newProfile);
            setLoading(false);
            
            try {
              await setDoc(docRef, { ...newProfile, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
            } catch (error) {
              console.error("Error creating user profile", error);
            }
          }
        }, (error) => {
          console.error("Error fetching user profile snapshot", error);
          setLoading(false);
        });
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const sendMagicLink = async (email: string) => {
    const actionCodeSettings = {
      url: window.location.href, // Redirects back to the current page
      handleCodeInApp: true,
    };
    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      toast.success(`Magic link sent to ${email}`);
    } catch (error: any) {
      if (error.code === 'auth/operation-not-allowed') {
        toast.error('Email link login is not enabled in Firebase Console. Please enable "Email/Password" -> "Email link (passwordless sign-in)".', { duration: 6000 });
      } else {
        toast.error('Error sending link: ' + error.message);
      }
      throw error;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      if (!cred.user.emailVerified) {
        toast.error('Please verify your email before logging in.');
        await signOut(auth);
        return;
      }
      toast.success('Successfully logged in');
      await logUserAction('User Login', 'User authenticated via Email/Password');
    } catch (error: any) {
      if (error.code === 'auth/multi-factor-auth-required') {
        const resolver = getMultiFactorResolver(auth, error);
        setMfaResolver(resolver);
      } else {
        toast.error('Login failed: ' + error.message);
      }
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, pass: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      await sendEmailVerification(cred.user);
      toast.success('Account created! Please check your email to verify.');
      await signOut(auth); // Log them out until verified
    } catch (error: any) {
      toast.error('Signup failed: ' + error.message);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent. Please check your inbox.');
    } catch (error: any) {
      toast.error('Password reset failed: ' + error.message);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast.success('Successfully logged in');
      await logUserAction('User Login', 'User authenticated via Google Sign-In');
    } catch (error: any) {
      if (error.code === 'auth/multi-factor-auth-required') {
        const resolver = getMultiFactorResolver(auth, error);
        setMfaResolver(resolver);
      } else {
        toast.error('Login failed: ' + error.message);
      }
    }
  };

  const cancelMfaLogin = () => {
    setMfaResolver(null);
  };

  const verifyMfa = async (code: string) => {
    if (!mfaResolver) return;
    try {
      const hint = mfaResolver.hints.find(h => h.factorId === 'totp') || mfaResolver.hints[0];
      const assertion = TotpMultiFactorGenerator.assertionForSignIn(hint.uid, code);
      await mfaResolver.resolveSignIn(assertion);
      setMfaResolver(null);
      toast.success('Successfully logged in with 2FA');
      await logUserAction('User Login (2FA)', 'User authenticated successfully using TOTP multi-factor');
    } catch (error: any) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out');
    } catch (error: any) {
      toast.error('Logout failed: ' + error.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, mfaResolver, cancelMfaLogin, verifyMfa, signInWithGoogle, sendMagicLink, signInWithEmail, signUpWithEmail, resetPassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
