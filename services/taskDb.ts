
import { collection, query, where, getDocs, setDoc, doc, deleteDoc, updateDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "./firebase";
import { Task } from '../types';

export const taskDb = {
  /**
   * Subscribe to real-time task updates for a user
   */
  subscribeToTasks(userId: string, callback: (tasks: Task[]) => void) {
    const q = query(collection(db, "tasks"), where("userId", "==", userId));
    return onSnapshot(q, (querySnapshot) => {
      const tasks: Task[] = [];
      querySnapshot.forEach((doc) => {
        tasks.push(doc.data() as Task);
      });
      // Sort locally by creation date (Firestore could also do this)
      callback(tasks.sort((a, b) => b.createdAt - a.createdAt));
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
  }
};
