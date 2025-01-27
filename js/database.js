class Database {
    static db = null;

    static async setup() {
        const request = indexedDB.open('ExerciseTrackerDB', 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            const store = db.createObjectStore('exercises', {
                keyPath: 'id',
                autoIncrement: true
            });
            store.createIndex('weekday', 'weekday');
            store.createIndex('isDone', 'isDone');
        };

        return new Promise((resolve, reject) => {
            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this.db);
            };
            request.onerror = () => reject(request.error);
        });
    }

    static async addExercise(exercise) {
        const transaction = this.db.transaction(['exercises'], 'readwrite');
        const store = transaction.objectStore('exercises');
        return store.add(exercise);
    }

    static async getExercise(id) {
        const transaction = this.db.transaction(['exercises'], 'readonly');
        const store = transaction.objectStore('exercises');
        return new Promise((resolve, reject) => {
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    static async updateExercise(exercise) {
        const transaction = this.db.transaction(['exercises'], 'readwrite');
        const store = transaction.objectStore('exercises');
        return store.put(exercise);
    }

    static async deleteExercise(id) {
        const transaction = this.db.transaction(['exercises'], 'readwrite');
        const store = transaction.objectStore('exercises');
        return store.delete(id);
    }

    static async getAllExercises() {
        const transaction = this.db.transaction(['exercises'], 'readonly');
        const store = transaction.objectStore('exercises');
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
}