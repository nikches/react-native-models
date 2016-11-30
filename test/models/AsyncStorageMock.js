export default class AsyncStorageMock {
    static setItem(key, value) {
        if (typeof(value) !== "string") {
            throw new Error ("Second argument should be string.");
        }

        return new Promise((resolve, reject) => {
            AsyncStorageMock.items[key] = value;
            resolve();
        });
    }

    static getItem(key) {
        return new Promise((resolve, reject) => {
            if (key in AsyncStorageMock.items) {
                resolve(AsyncStorageMock.items[key]);
            } else {
                resolve(null);
            }
        });
    }

    static removeItem(key) {
        return new Promise((resolve, reject) => {
            delete AsyncStorageMock.items[key];
            resolve();
        });
    }

    static clear() {
        return new Promise((resolve, reject) => {
            AsyncStorageMock.items = Object.create(null);
            resolve();
        });
    }
}

AsyncStorageMock.items = Object.create(null);