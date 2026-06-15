/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApp, getApps, FirebaseApp } from "firebase/app";
import { 
  getAuth, 
  Auth, 
  User, 
  onAuthStateChanged,
  onIdTokenChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut
} from "firebase/auth";
import { 
  getFirestore, 
  Firestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot
} from "firebase/firestore";

// Enum and Interfaces from Firestore security rules skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

import firebaseConfig from "../../firebase-applet-config.json";

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null, activeAuth: Auth | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: activeAuth?.currentUser?.uid || "anonymous_local",
      email: activeAuth?.currentUser?.email || "anonymous@local.dev",
      emailVerified: activeAuth?.currentUser?.emailVerified || true,
      isAnonymous: activeAuth?.currentUser?.isAnonymous || false,
      tenantId: activeAuth?.currentUser?.tenantId || null,
      providerInfo: activeAuth?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error Payload Context: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// 1. Determine if real firebase-applet-config.json exists
let isRealFirebaseAvailable = true;
let configData: any = firebaseConfig;

// Global cached singletons
let appInstance: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;
let authInstance: Auth | null = null;

try {
  if (firebaseConfig && firebaseConfig.apiKey) {
    appInstance = initializeApp(firebaseConfig);
    dbInstance = getFirestore(appInstance, firebaseConfig.firestoreDatabaseId);
    authInstance = getAuth(appInstance);
  } else {
    isRealFirebaseAvailable = false;
  }
} catch (e) {
  console.warn("Real Firebase failed to initialize with provided config:", e);
  isRealFirebaseAvailable = false;
}

// Simulated Local/Offline State Engine fallback
class OfflineAuthMock {
  currentUser: any = null;
  private listeners: ((user: any) => void)[] = [];

  constructor() {
    // Populate an initial local session from localStorage to feel completely real
    try {
      const stored = localStorage.getItem("firebase_auth_mock");
      if (stored) {
        this.currentUser = JSON.parse(stored);
      } else {
        // Auto sign in a beautiful mock professional owner so they aren't forced to sign in to see database items!
        this.currentUser = {
          uid: "usr_studio_owner",
          displayName: "Studio Innovator",
          email: "innovator@ai-studio.dev",
          emailVerified: true,
          photoURL: "https://lh3.googleusercontent.com/a/default-user"
        };
        localStorage.setItem("firebase_auth_mock", JSON.stringify(this.currentUser));
      }
    } catch {
      this.currentUser = null;
    }
  }

  onAuthStateChanged(callback: (user: any) => void) {
    this.listeners.push(callback);
    callback(this.currentUser);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  signInWithPopup() {
    const mockUser = {
      uid: "usr_google_authenticated",
      displayName: "Creator Pro",
      email: "creator.pro@ai-studio.dev",
      emailVerified: true,
      photoURL: "https://lh3.googleusercontent.com/a/default-user"
    };
    this.currentUser = mockUser;
    localStorage.setItem("firebase_auth_mock", JSON.stringify(mockUser));
    this.listeners.forEach(l => l(mockUser));
    return Promise.resolve({ user: mockUser });
  }

  signOut() {
    this.currentUser = null;
    localStorage.removeItem("firebase_auth_mock");
    this.listeners.forEach(l => l(null));
    return Promise.resolve();
  }
}

export const mockAuthInstance = new OfflineAuthMock();

// Main safe initializers
export function getFirebaseApp(configInput?: any): FirebaseApp | null {
  if (appInstance) return appInstance;
  
  if (configInput) {
    try {
      appInstance = initializeApp(configInput);
      isRealFirebaseAvailable = true;
      return appInstance;
    } catch (e) {
      console.warn("Real Firebase App failed to initialize. Relying on fallback.", e);
    }
  }
  return null;
}

export function getFirebaseDB(configInput?: any): Firestore | null {
  if (dbInstance) return dbInstance;
  const app = getFirebaseApp(configInput);
  if (app && configInput) {
    try {
      dbInstance = getFirestore(app, configInput.firestoreDatabaseId);
      return dbInstance;
    } catch (e) {
      console.warn("Real Firestore failed to initialize.", e);
    }
  }
  return null;
}

export function getFirebaseAuth(configInput?: any): Auth | null {
  try {
    if (authInstance) return authInstance;
    const app = getFirebaseApp(configInput);
    if (app) {
      authInstance = getAuth(app);
      return authInstance;
    }
  } catch (e) {
    console.warn("Real Auth failed to initialize.", e);
  }
  return null;
}

export { isRealFirebaseAvailable };

// Unified singletons
export const auth: Auth = (authInstance || mockAuthInstance) as unknown as Auth;
export const db: Firestore | null = dbInstance;

