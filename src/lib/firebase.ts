import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import baseFirebaseConfig from '../../firebase-applet-config.json'; // Provided config

// Load config from environment if provided for increased security, otherwise fallback to the JSON definition
const config = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || baseFirebaseConfig.projectId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || baseFirebaseConfig.appId,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || baseFirebaseConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || baseFirebaseConfig.authDomain,
  firestoreDatabaseId: import.meta.env.VITE_FIRESTORE_DATABASE_ID || baseFirebaseConfig.firestoreDatabaseId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || baseFirebaseConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || baseFirebaseConfig.messagingSenderId,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || baseFirebaseConfig.measurementId,
};

const app = initializeApp(config);

// You MUST use the firestoreDatabaseId from the firebase-applet-config.json file or override
export const db = getFirestore(app, config.firestoreDatabaseId);
export const auth = getAuth();

// Connection testing
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'users', 'connection-test'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();
