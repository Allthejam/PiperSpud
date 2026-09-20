// Spud the Piper - Firebase Client SDK Integration
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAnalytics, Analytics, isSupported } from 'firebase/analytics';

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAcKzSAHnKvcCIjS5ha2q9mPkgsnegv7OY",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "piperspud-56c0a.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "piperspud-56c0a",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "piperspud-56c0a.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "544022145372",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:544022145372:web:73e635648eb6ab9b57b999",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-MMXX2SB46X"
};

// Singleton Firebase initialization
let app: FirebaseApp;
let db: Firestore | null = null;
let auth: Auth | null = null;
let storage: FirebaseStorage | null = null;
let analytics: Analytics | null = null;

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  if (typeof window !== 'undefined') {
    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);
    isSupported().then((yes) => {
      if (yes) {
        analytics = getAnalytics(app);
      }
    }).catch(() => {});
  }
} catch (error) {
  console.warn('Firebase initialization warning:', error);
}

export { app, db, auth, storage, analytics };

/**
 * Upload a file to Firebase Storage under a designated folder
 * @param file File to upload
 * @param folder Folder prefix e.g. "social_uploads" or "reviews"
 * @returns Public download URL string
 */
export async function uploadToStorage(file: File, folder: string = 'uploads'): Promise<string> {
  if (!storage) {
    throw new Error('Firebase Storage is not initialized.');
  }

  const fileExt = file.name.split('.').pop() || 'jpg';
  const cleanFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
  const storageRef = ref(storage, `${folder}/${cleanFileName}`);

  const snapshot = await uploadBytes(storageRef, file);
  const downloadUrl = await getDownloadURL(snapshot.ref);
  return downloadUrl;
}
