import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from './firebase';

export const trackEvent = async (eventName: string, properties?: Record<string, any>) => {
  try {
    // 1. Google Analytics (if available/configured in window)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, properties);
    }
    
    // 2. Fallback basic event logging to Firestore
    const user = auth.currentUser;
    const logData: any = {
      event: eventName,
      properties: properties || {},
      createdAt: serverTimestamp(),
      userId: user ? user.uid : 'anonymous',
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'unknown'
    };
    
    await addDoc(collection(db, 'analytics_events'), logData);
  } catch (error) {
    console.error("Failed to track event:", error);
  }
};
