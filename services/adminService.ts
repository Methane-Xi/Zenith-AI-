import { 
  collection, 
  getDocs, 
  updateDoc, 
  doc, 
  query, 
  limit, 
  orderBy,
  getDoc
} from "firebase/firestore";
import { db } from "./firebase";
import { User, Task } from "../types";

export const adminService = {
  /**
   * Fetch all users for management
   */
  async getAllUsers(): Promise<User[]> {
    const querySnapshot = await getDocs(collection(db, "users"));
    return querySnapshot.docs.map(doc => doc.data() as User);
  },

  /**
   * Update a user's role (Promote/Demote)
   */
  async updateUserRole(userId: string, newRole: 'user' | 'admin'): Promise<void> {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { role: newRole });
  },

  /**
   * Toggle a user's verification status
   */
  async toggleUserVerification(userId: string, status: boolean): Promise<void> {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { isVerified: status });
  },

  /**
   * Fetch system-wide stats
   */
  async getSystemStats() {
    const usersSnap = await getDocs(collection(db, "users"));
    const tasksSnap = await getDocs(collection(db, "tasks"));
    
    return {
      totalUsers: usersSnap.size,
      totalTasks: tasksSnap.size,
      systemHealth: 'OPTIMAL',
      lastSync: new Date().toISOString()
    };
  }
};
