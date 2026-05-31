"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import type { SemesterDetails } from "@/types";

export type SyncStatusType = "idle" | "syncing" | "synced" | "error";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  syncStatus: SyncStatusType;
  lastSyncedTime: Date | null;
  syncErrorMessage: string | null;
  loginWithEmail: (email: string, password: string) => Promise<User>;
  signUpWithEmail: (email: string, password: string) => Promise<User>;
  loginWithGoogle: () => Promise<User>;
  logout: () => Promise<void>;
  triggerCloudSync: (semesters: Record<string, SemesterDetails>, selectedKey: string | null) => Promise<void>;
  pullAndMergeData: (localSemesters: Record<string, SemesterDetails>, localSelectedKey: string | null) => Promise<{
    mergedSemesters: Record<string, SemesterDetails>;
    mergedSelectedKey: string | null;
    synced: boolean;
  }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to merge local storage data with Supabase cloud data safely
export function mergeSemesters(
  local: Record<string, SemesterDetails>,
  cloud: Record<string, SemesterDetails>
): Record<string, SemesterDetails> {
  const merged: Record<string, SemesterDetails> = { ...cloud };
  
  for (const key in local) {
    if (!merged[key]) {
      merged[key] = local[key];
    } else {
      const localSem = local[key];
      const cloudSem = merged[key];

      // Smart Resolution:
      // 1. If one is manual entries and other has rich course lists, prefer the rich course list
      if (localSem.isManual && !cloudSem.isManual) {
        merged[key] = cloudSem;
      } else if (!localSem.isManual && cloudSem.isManual) {
        merged[key] = localSem;
      } else {
        // 2. Both are course-based or both are manual. Prefer the one with more courses or total credits
        const localCoursesCount = localSem.courses?.length || 0;
        const cloudCoursesCount = cloudSem.courses?.length || 0;
        
        if (localCoursesCount >= cloudCoursesCount) {
          merged[key] = localSem;
        } else {
          merged[key] = cloudSem;
        }
      }
    }
  }
  return merged;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatusType>("idle");
  const [lastSyncedTime, setLastSyncedTime] = useState<Date | null>(null);
  const [syncErrorMessage, setSyncErrorMessage] = useState<string | null>(null);
  
  // Use a ref to store current user to avoid circular re-renders in callbacks
  const userRef = useRef<User | null>(null);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (!currentUser) {
        setSyncStatus("idle");
        setLastSyncedTime(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Email/Password Login
  const loginWithEmail = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Signed In Successfully",
        description: `Welcome back, ${result.user.email}!`,
      });
      return result.user;
    } catch (error: any) {
      console.error("Firebase Login Error", error);
      let message = "Invalid email or password.";
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        message = "Incorrect email or password.";
      } else if (error.code === "auth/invalid-email") {
        message = "Invalid email format.";
      } else if (error.code === "auth/too-many-requests") {
        message = "Account locked temporarily due to too many failed attempts. Try again later.";
      }
      toast({
        title: "Authentication Failed",
        description: message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Email/Password Registration
  const signUpWithEmail = async (email: string, password: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      toast({
        title: "Account Created Successfully",
        description: `Welcome to Guru! Cloud syncing is now active.`,
      });
      return result.user;
    } catch (error: any) {
      console.error("Firebase Registration Error", error);
      let message = "Could not register account. Please try again.";
      if (error.code === "auth/email-already-in-use") {
        message = "This email is already in use by another account.";
      } else if (error.code === "auth/weak-password") {
        message = "Password must be at least 6 characters long.";
      } else if (error.code === "auth/invalid-email") {
        message = "Invalid email format.";
      }
      toast({
        title: "Registration Failed",
        description: message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Google OAuth Login
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      toast({
        title: "Signed In with Google",
        description: `Welcome, ${result.user.displayName || result.user.email}!`,
      });
      return result.user;
    } catch (error: any) {
      console.error("Google Auth Error", error);
      toast({
        title: "Google Authentication Failed",
        description: error.message || "An issue occurred during Google Sign-in.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Log Out
  const logout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Signed Out",
        description: "You have logged out. App will now save data locally.",
      });
    } catch (error: any) {
      console.error("Logout Error", error);
      toast({
        title: "Sign Out Failed",
        description: "An error occurred while logging out.",
        variant: "destructive",
      });
    }
  };

  // Save data to Supabase (Cloud Sync)
  const triggerCloudSync = useCallback(async (
    semesters: Record<string, SemesterDetails>,
    selectedKey: string | null
  ) => {
    const currentUser = userRef.current;
    if (!currentUser) return;

    setSyncStatus("syncing");
    setSyncErrorMessage(null);

    try {
      const { error } = await supabase.from("user_results").upsert({
        firebase_uid: currentUser.uid,
        semesters_data: semesters,
        selected_semester_key: selectedKey,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      setSyncStatus("synced");
      setLastSyncedTime(new Date());
    } catch (error: any) {
      console.error("Supabase Cloud Sync Error:", error);
      setSyncStatus("error");
      setSyncErrorMessage(error.message || "Could not sync data to Supabase database.");
      
      // Notify user only periodically to avoid alert fatigue
      toast({
        title: "Cloud Sync Failed",
        description: "We couldn't backup your data. Saving locally instead.",
        variant: "destructive",
      });
    }
  }, []);

  // Fetch Cloud data and merge with Local Storage data
  const pullAndMergeData = useCallback(async (
    localSemesters: Record<string, SemesterDetails>,
    localSelectedKey: string | null
  ): Promise<{
    mergedSemesters: Record<string, SemesterDetails>;
    mergedSelectedKey: string | null;
    synced: boolean;
  }> => {
    const currentUser = userRef.current;
    if (!currentUser) {
      return { mergedSemesters: localSemesters, mergedSelectedKey: localSelectedKey, synced: false };
    }

    setSyncStatus("syncing");

    try {
      const { data, error } = await supabase
        .from("user_results")
        .select("semesters_data, selected_semester_key")
        .eq("firebase_uid", currentUser.uid)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        // Cloud has no data yet, so upload current local storage data
        await supabase.from("user_results").upsert({
          firebase_uid: currentUser.uid,
          semesters_data: localSemesters,
          selected_semester_key: localSelectedKey,
          updated_at: new Date().toISOString(),
        });
        setSyncStatus("synced");
        setLastSyncedTime(new Date());
        return { mergedSemesters: localSemesters, mergedSelectedKey: localSelectedKey, synced: true };
      }

      // Cloud has data. Let's merge it!
      const cloudSemesters = (data.semesters_data as Record<string, SemesterDetails>) || {};
      const cloudSelectedKey = data.selected_semester_key || null;

      const mergedSem = mergeSemesters(localSemesters, cloudSemesters);
      // If we have a local selected key, use it. If not, use cloud selected key
      const mergedKey = localSelectedKey || cloudSelectedKey;

      // If changes occurred, save the merged result back to cloud immediately
      const hasChanges = JSON.stringify(mergedSem) !== JSON.stringify(cloudSemesters) || mergedKey !== cloudSelectedKey;
      if (hasChanges) {
        await supabase.from("user_results").upsert({
          firebase_uid: currentUser.uid,
          semesters_data: mergedSem,
          selected_semester_key: mergedKey,
          updated_at: new Date().toISOString(),
        });
      }

      setSyncStatus("synced");
      setLastSyncedTime(new Date());
      return { mergedSemesters: mergedSem, mergedSelectedKey: mergedKey, synced: true };
    } catch (error: any) {
      console.error("Error pulling and merging cloud data:", error);
      setSyncStatus("error");
      setSyncErrorMessage(error.message || "Failed to load cloud backup.");
      toast({
        title: "Sync Warning",
        description: "Failed to download cloud data. Using local browser data instead.",
        variant: "destructive",
      });
      return { mergedSemesters: localSemesters, mergedSelectedKey: localSelectedKey, synced: false };
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        syncStatus,
        lastSyncedTime,
        syncErrorMessage,
        loginWithEmail,
        signUpWithEmail,
        loginWithGoogle,
        logout,
        triggerCloudSync,
        pullAndMergeData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
