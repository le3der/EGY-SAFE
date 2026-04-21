import { collection, addDoc, serverTimestamp, writeBatch, doc } from 'firebase/firestore';
import { db, auth } from './firebase';

const EVENT_BUFFER: any[] = [];
let bufferTimeout: any = null;

const flushEvents = async () => {
  if (EVENT_BUFFER.length === 0) return;
  
  const eventsToFlush = [...EVENT_BUFFER];
  EVENT_BUFFER.length = 0; // Clear buffer

  try {
    const batch = writeBatch(db);
    const eventsRef = collection(db, 'analytics_events');

    eventsToFlush.forEach((logData) => {
      const docRef = doc(eventsRef);
      batch.set(docRef, logData);
    });

    await batch.commit();
  } catch (error) {
    console.error("Failed to track events batch:", error);
    // Put them back in front (naive retry)
    EVENT_BUFFER.unshift(...eventsToFlush);
  }
};

// Also flush when user leaves page
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    // We can't guarantee async commit finishes, but we try
    flushEvents();
  });
}

export const trackEvent = async (eventName: string, properties?: Record<string, any>) => {
  try {
    // 1. Google Analytics (if available/configured in window)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, properties);
    }
    
    // 2. Fallback basic event logging to Firestore - USE BATCHING
    const user = auth.currentUser;
    const logData: any = {
      event: eventName,
      properties: properties || {},
      createdAt: serverTimestamp(),
      userId: user ? user.uid : 'anonymous',
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'unknown'
    };
    
    EVENT_BUFFER.push(logData);

    // Debounce flush (flush every 5 seconds or if buffer hits 10)
    if (EVENT_BUFFER.length >= 10) {
      if (bufferTimeout) clearTimeout(bufferTimeout);
      flushEvents();
    } else if (!bufferTimeout) {
      bufferTimeout = setTimeout(() => {
        flushEvents();
        bufferTimeout = null;
      }, 5000);
    }
  } catch (error) {
    console.error("Failed to queue event:", error);
  }
};
