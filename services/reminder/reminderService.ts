import { db } from '../firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { Task } from '../../types';

export const reminderService = {
  async scanAndProcessReminders(userId: string) {
    try {
      const now = Date.now();
      const q = query(
        collection(db, 'tasks'),
        where('userId', '==', userId),
        where('reminderTime', '<', now),
        where('reminderStatus', '==', 'pending'),
        where('status', '!=', 'COMPLETED')
      );

      const snap = await getDocs(q);
      const updates = snap.docs.map(async (d) => {
        const task = d.data() as Task;
        const taskRef = doc(db, 'tasks', d.id);
        
        await updateDoc(taskRef, {
          reminderStatus: 'expired',
          notificationSent: true,
          updatedAt: now
        });

        if (task.autoCarryForward) {
          // Logic for auto-carry forward could go here
          // e.g., suggest a new time 24h later
        }
        
        return { id: d.id, title: task.title };
      });

      return await Promise.all(updates);
    } catch (error) {
      console.error('Error processing reminders:', error);
      return [];
    }
  }
};
