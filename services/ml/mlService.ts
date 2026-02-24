import { db } from '../firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { MLProfile, Task } from '../../types';

export const mlService = {
  async updateProfileOnTaskCompletion(userId: string, task: Task) {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) return;
      
      const userData = userSnap.data();
      const currentProfile: MLProfile = userData.mlProfile || {
        completionRate: 0,
        averageDuration: 0,
        delayFrequency: 0,
        productivityScore: 0,
        riskPattern: 'stable'
      };

      const totalCompleted = (userData.usageStats?.totalTasksCompleted || 0) + 1;
      const totalCreated = userData.usageStats?.totalTasksCreated || 1;
      
      const newCompletionRate = (totalCompleted / totalCreated) * 100;
      
      // Simple productivity score calculation
      const newProductivityScore = Math.min(100, currentProfile.productivityScore + 2);

      await updateDoc(userRef, {
        'mlProfile.completionRate': newCompletionRate,
        'mlProfile.productivityScore': newProductivityScore,
        'usageStats.totalTasksCompleted': totalCompleted
      });
    } catch (error) {
      console.error('Error updating ML profile:', error);
    }
  },

  async resetProfile(userId: string) {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      mlProfile: {
        completionRate: 0,
        averageDuration: 0,
        delayFrequency: 0,
        productivityScore: 0,
        riskPattern: 'stable'
      }
    });
  }
};
