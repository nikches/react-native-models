export default class NullStorage {
    getItem (key, callback) {
        return new Promise((resolve, reject) => {
            resolve(null);

            if (typeof(callback) === "function") {
                callback(null, null);
            }
        });
    }

    setItem (key, value, callback) {
        return new Promise((resolve, reject) => {
            resolve(null);
            if (typeof(callback) === "function") {
                callback(null);
            }
        });
    }
}
