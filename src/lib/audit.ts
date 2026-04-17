import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from './firebase';

export const logUserAction = async (action: string, details?: string) => {
  const user = auth.currentUser;
  if (!user) return;
  
  try {
    const logData: any = {
      userId: user.uid,
      action,
      createdAt: serverTimestamp()
    };
    if (details) {
      logData.details = details;
    }
    
    await addDoc(collection(db, 'logs'), logData);
  } catch (error) {
    console.error("Failed to log action:", error);
  }
};
