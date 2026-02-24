import { db } from '../firebase';
import { 
  collection, 
  query, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  where, 
  getDoc,
  Timestamp,
  orderBy,
  limit
} from 'firebase/firestore';
import { User, Task, SystemStats } from '../../types';

export const adminService = {
  async getSystemStats(): Promise<SystemStats> {
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const tasksSnap = await getDocs(collection(db, 'tasks'));
      
      const now = Date.now();
      const expiredReminders = tasksSnap.docs.filter(d => {
        const data = d.data();
        return data.reminderTime && data.reminderTime < now && data.status !== 'COMPLETED';
      }).length;

      return {
        totalUsers: usersSnap.size,
        activeUsers: usersSnap.docs.filter(d => d.data().status === 'active').length,
        totalTasks: tasksSnap.size,
        expiredReminders,
        completedTasks: tasksSnap.docs.filter(d => d.data().status === 'COMPLETED').length,
        aiRequestsToday: 0, // Would need a separate collection for tracking
        systemErrors: 0,
        systemHealth: 'Optimal'
      };
    } catch (error) {
      console.error('Error fetching system stats:', error);
      throw error;
    }
  },

  async getAllUsers(): Promise<User[]> {
    const usersSnap = await getDocs(collection(db, 'users'));
    return usersSnap.docs.map(d => ({ uid: d.id, ...d.data() } as User));
  },

  async updateUserRole(userId: string, role: 'user' | 'admin'): Promise<void> {
    await updateDoc(doc(db, 'users', userId), { role });
  },

  async updateUserStatus(userId: string, status: 'active' | 'disabled'): Promise<void> {
    await updateDoc(doc(db, 'users', userId), { status });
  },

  async getAllTasks(): Promise<Task[]> {
    const tasksSnap = await getDocs(collection(db, 'tasks'));
    return tasksSnap.docs.map(d => ({ id: d.id, ...d.data() } as Task));
  },

  async forceCompleteTask(taskId: string): Promise<void> {
    await updateDoc(doc(db, 'tasks', taskId), { status: 'COMPLETED', updatedAt: Date.now() });
  },

  async deleteTask(taskId: string): Promise<void> {
    await deleteDoc(doc(db, 'tasks', taskId));
  },

  async getExpiredReminders(): Promise<Task[]> {
    const now = Date.now();
    const q = query(
      collection(db, 'tasks'), 
      where('reminderTime', '<', now),
      where('status', '!=', 'COMPLETED')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Task));
  }
};
