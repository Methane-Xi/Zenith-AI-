import { 
  collection, 
  query, 
  where, 
  setDoc, 
  doc, 
  deleteDoc, 
  updateDoc, 
  onSnapshot 
} from "firebase/firestore";
import { db } from "./firebase";
import { Task, User } from '../types';

export const taskDb = {
  /**
   * Subscribe to real-time task updates for a user
   */
  subscribeToTasks(userId: string, callback: (tasks: Task[]) => void) {
    if (!db.type) return () => {}; // Guard for uninitialized db
    const q = query(collection(db, "tasks"), where("userId", "==", userId));
    return onSnapshot(q, (querySnapshot) => {
      const tasks: Task[] = [];
      querySnapshot.forEach((doc) => {
        tasks.push(doc.data() as Task);
      });
      // Sort locally by creation date
      callback(tasks.sort((a, b) => b.createdAt - a.createdAt));
    }, (error) => {
      console.error("Firestore Task Subscription Error:", error);
    });
  },

  async saveTask(task: Task) {
    await setDoc(doc(db, "tasks", task.id), task);
  },

  async updateTask(taskId: string, updates: Partial<Task>) {
    const taskRef = doc(db, "tasks", taskId);
    await updateDoc(taskRef, updates);
  },

  async deleteTask(taskId: string) {
    await deleteDoc(doc(db, "tasks", taskId));
  },

  async updateUser(userId: string, updates: Partial<User>) {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, updates);
  }
};