
import { Student, TeacherVisit } from '../types';

const DB_NAME = 'HujraManagerDB';
const DB_VERSION = 1;

export class HujraDatabase {
  private db: IDBDatabase | null = null;

  async open(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = request.result;
        if (!db.objectStoreNames.contains('students')) {
          db.createObjectStore('students', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('visits')) {
          db.createObjectStore('visits', { keyPath: 'id' });
        }
      };
    });
  }

  // Students Methods
  async getAllStudents(): Promise<Student[]> {
    const db = await this.open();
    return new Promise((resolve) => {
      const transaction = db.transaction('students', 'readonly');
      const store = transaction.objectStore('students');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
    });
  }

  async saveStudent(student: Student): Promise<void> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('students', 'readwrite');
      const store = transaction.objectStore('students');
      const request = store.put(student);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteStudent(id: string): Promise<void> {
    const db = await this.open();
    return new Promise((resolve) => {
      const transaction = db.transaction(['students', 'visits'], 'readwrite');
      transaction.objectStore('students').delete(id);
      
      // هەروەها سڕینەوەی هەموو سەردانەکانی ئەو خوێندکارە
      const visitStore = transaction.objectStore('visits');
      const index = visitStore.getAll();
      index.onsuccess = () => {
        const visits = index.result as TeacherVisit[];
        visits.filter(v => v.studentId === id).forEach(v => visitStore.delete(v.id));
      };
      
      transaction.oncomplete = () => resolve();
    });
  }

  // Visits Methods
  async getAllVisits(): Promise<TeacherVisit[]> {
    const db = await this.open();
    return new Promise((resolve) => {
      const transaction = db.transaction('visits', 'readonly');
      const store = transaction.objectStore('visits');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
    });
  }

  async saveVisit(visit: TeacherVisit): Promise<void> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('visits', 'readwrite');
      const store = transaction.objectStore('visits');
      const request = store.put(visit);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteVisit(id: string): Promise<void> {
    const db = await this.open();
    return new Promise((resolve) => {
      const transaction = db.transaction('visits', 'readwrite');
      transaction.objectStore('visits').delete(id);
      transaction.oncomplete = () => resolve();
    });
  }
}

export const db = new HujraDatabase();
