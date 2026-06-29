import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Application } from '../types';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  education: string;
  activeGoal: string;
}

interface UserData {
  uid: string;
  email: string;
  displayName: string;
  profile: UserProfile;
  enrolledCourses: string[];
  completedModules: Record<string, string[]>;
  checkedChecklist: Record<string, boolean>;
  earnedCertificates: string[];
  savedItems: Array<{ id: string; title: string; type: string; desc: string }>;
  applications: Application[];
  updatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
  updateCareerProgress: (progress: {
    enrolledCourses?: string[];
    completedModules?: Record<string, string[]>;
    checkedChecklist?: Record<string, boolean>;
    earnedCertificates?: string[];
  }) => Promise<void>;
  updateBookmarks: (savedItems: Array<{ id: string; title: string; type: string; desc: string }>) => Promise<void>;
  updateApplications: (applications: Application[]) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Monitor firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Sync user data in real time from Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        
        // Listen to changes
        const unsubFirestore = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserData(docSnap.data() as UserData);
          } else {
            // Create initial document
            const initialData: UserData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'Honored Guest',
              profile: {
                name: firebaseUser.displayName || 'Honored Guest',
                email: firebaseUser.email || '',
                phone: localStorage.getItem('recruit_user_phone') || '+91 98765 43210',
                location: localStorage.getItem('recruit_user_location') || 'Delhi NCR',
                education: localStorage.getItem('recruit_user_education') || 'Graduate',
                activeGoal: localStorage.getItem('recruit_user_active_goal') || 'Government & Public Sector Career'
              },
              enrolledCourses: JSON.parse(localStorage.getItem('recruit_enrolled_courses') || '[]'),
              completedModules: JSON.parse(localStorage.getItem('recruit_completed_modules') || '{}'),
              checkedChecklist: JSON.parse(localStorage.getItem('recruit_checked_checklist') || '{}'),
              earnedCertificates: JSON.parse(localStorage.getItem('recruit_earned_certificates') || '[]'),
              savedItems: [
                { id: '1', title: 'PM Mudra Loan Scheme', type: 'Scheme', desc: 'Collateral free funding' },
                { id: '2', title: 'Full-Stack JavaScript certification', type: 'Course', desc: '12 Weeks upskilling path' }
              ],
              applications: JSON.parse(localStorage.getItem('recruit_applications') || '[]'),
              updatedAt: new Date().toISOString()
            };
            setDoc(userDocRef, initialData).then(() => {
              setUserData(initialData);
            });
          }
        }, (error) => {
          console.error("Firestore error:", error);
        });

        return () => unsubFirestore();
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, name: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name });
    
    // Create initial user document in firestore
    const userDocRef = doc(db, 'users', userCredential.user.uid);
    const initialData: UserData = {
      uid: userCredential.user.uid,
      email: email,
      displayName: name,
      profile: {
        name: name,
        email: email,
        phone: '+91 98765 43210',
        location: 'Delhi NCR',
        education: 'Graduate',
        activeGoal: 'Government & Public Sector Career'
      },
      enrolledCourses: JSON.parse(localStorage.getItem('recruit_enrolled_courses') || '[]'),
      completedModules: JSON.parse(localStorage.getItem('recruit_completed_modules') || '{}'),
      checkedChecklist: JSON.parse(localStorage.getItem('recruit_checked_checklist') || '{}'),
      earnedCertificates: JSON.parse(localStorage.getItem('recruit_earned_certificates') || '[]'),
      savedItems: [
        { id: '1', title: 'PM Mudra Loan Scheme', type: 'Scheme', desc: 'Collateral free funding' },
        { id: '2', title: 'Full-Stack JavaScript certification', type: 'Course', desc: '12 Weeks upskilling path' }
      ],
      applications: JSON.parse(localStorage.getItem('recruit_applications') || '[]'),
      updatedAt: new Date().toISOString()
    };
    await setDoc(userDocRef, initialData);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const signOutUser = async () => {
    await firebaseSignOut(auth);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const updateUserProfile = async (profileUpdate: Partial<UserProfile>) => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    const currentProfile = userData?.profile || {
      name: user.displayName || 'Honored Guest',
      email: user.email || '',
      phone: '',
      location: '',
      education: '',
      activeGoal: ''
    };
    await updateDoc(userDocRef, {
      profile: { ...currentProfile, ...profileUpdate },
      updatedAt: new Date().toISOString()
    });
  };

  const updateCareerProgress = async (progress: {
    enrolledCourses?: string[];
    completedModules?: Record<string, string[]>;
    checkedChecklist?: Record<string, boolean>;
    earnedCertificates?: string[];
  }) => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    const updatePayload: any = {};
    if (progress.enrolledCourses) updatePayload.enrolledCourses = progress.enrolledCourses;
    if (progress.completedModules) updatePayload.completedModules = progress.completedModules;
    if (progress.checkedChecklist) updatePayload.checkedChecklist = progress.checkedChecklist;
    if (progress.earnedCertificates) updatePayload.earnedCertificates = progress.earnedCertificates;
    
    updatePayload.updatedAt = new Date().toISOString();
    await updateDoc(userDocRef, updatePayload);
  };

  const updateBookmarks = async (savedItems: Array<{ id: string; title: string; type: string; desc: string }>) => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, {
      savedItems,
      updatedAt: new Date().toISOString()
    });
  };

  const updateApplications = async (applications: Application[]) => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, {
      applications,
      updatedAt: new Date().toISOString()
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      userData,
      loading,
      signIn,
      signUp,
      signInWithGoogle,
      signOutUser,
      resetPassword,
      updateUserProfile,
      updateCareerProgress,
      updateBookmarks,
      updateApplications
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
