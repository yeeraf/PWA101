// stores/todo.js
import { defineStore } from 'pinia'

export const useToDoStore = defineStore('todo', {
    state: () => {
        return {
            database: null,
            db_name: 'pwa_101',
            db_version: 1
        }
    },
    actions: {
        async initDatabase() {
            return new Promise((resolve, reject) => {

                let request = window.indexedDB.open(this.db_name, this.db_version);

                request.onerror = e => {
                    console.log('Error opening db', e);
                    reject('Error');
                };

                request.onsuccess = e => {
                    this.database = e.target.result;
                    resolve(e.target.result);
                };

                request.onupgradeneeded = e => {
                    console.log('onupgradeneeded');

                    // If db version has changed then remove the old db
                    // if (e.oldVersion === 1) {
                    //     e.target.result.deleteObjectStore("todos");
                    // }

                    let db = e.target.result;
                    db.createObjectStore("todos", { autoIncrement: true, keyPath: 'id' });
                };
            });
        },

        async createTodo(data) {
            return new Promise((resolve, reject) => {

                let trans = this.database.transaction(['todos'], 'readwrite');

                const _id = parseInt(data.id);
                const request = trans.objectStore('todos').get(_id);

                trans.oncomplete = e => {
                    resolve();
                };

                request.onsuccess = (e) => {
                    const find = e.target.result;
                    if (find) {
                        find.data = data.data;
                        const updateRequest = trans.objectStore('todos').put(find);

                        updateRequest.onerror = () => {
                            console.error('Error storing the updated database.');
                        };

                        updateRequest.onsuccess = () => {
                            resolve(find)
                        };
                    } else {
                        trans.objectStore('todos').add(data);
                    }
                }
            });
        },

        async getTodos() {
            return new Promise((resolve, reject) => {
                this.database.transaction('todos')
                    .objectStore('todos')
                    .getAll()
                    .onsuccess = (e) => {
                        resolve(e.target.result);
                    };
            });
        },

        async getTodo(id) {
            return new Promise((resolve, reject) => {
                const transaction = this.database.transaction('todos', 'readwrite');

                const _id = parseInt(id);
                const request = transaction.objectStore('todos').get(_id);

                request.onerror = () => {
                    reject('Error finding in the database.');
                };

                request.onsuccess = (e) => {
                    const find = e.target.result;
                    if (find) {
                        resolve(find);
                    } else {
                        resolve(null);
                    }
                }
            });
        },

        async deleteTodo(id) {
            return new Promise((resolve, reject) => {
                const _id = parseInt(id);
                let trans = this.database.transaction(['todos'], 'readwrite');

                trans.oncomplete = e => {
                    resolve();
                };

                trans.objectStore('todos').delete(_id);
            });
        }
    },
})