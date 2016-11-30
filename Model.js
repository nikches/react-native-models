import ModelBase from "./ModelBase";
let storageProvider = null;
try {
    const ReactNative = require("react-native");
    storageProvider = ReactNative.AsyncStorage;
} catch (error) {
    storageProvider = require("./test/models/AsyncStorageMock").default;
}

export default class Model extends ModelBase {
    static get className() {
        return "Model";
    }

    /**
     * Write self into Storage.
     *
     * @param {string} key Storage key.
     * @return {Promise}
     */
    store(key) {
        if (typeof(key) !== "string") {
            key = this.constructor.className;
        }

        const lastChar = key.slice(-1);
        ["*", "/"].forEach((char) => {
            if (char === lastChar) {
                throw new Error(`Model key shouldn't ending at "${char}".`);
            }
        });

        const itemsPath = Model.getItemsPath(key);
        return new Promise((resolve, reject) => {
            const data = this.serialize();

            storageProvider.setItem(key, data).then(() => {
                if (itemsPath === null) {
                    resolve();
                } else {
                    return storageProvider.getItem(itemsPath);
                }
            }).then((itemsJson) => {
                let items = [];

                if (itemsJson !== undefined && itemsJson !== null) {
                    items = JSON.parse(itemsJson);
                }

                if (items.indexOf(key) === -1) {
                    items.push(key);
                }

                return storageProvider.setItem(itemsPath, JSON.stringify(items));
            }).then(() => {
                resolve();
            }).catch((error) => {
                reject(error);
            });
        });
    }

    /**
     * Get path of items.
     * /example/items
     * @param  {string} source path
     * @return {Promise}
     */
    static getItemsPath(path) {
        if (path.charAt(0) !== "/") {
            return null;
        }

        const lastIndexOfSlash = path.lastIndexOf("/");
        if (lastIndexOfSlash === -1) {
            return null;
        }

        return path.slice(0, lastIndexOfSlash) + "/_items";
    }

    /**
     * Read object from Storage.
     *
     * @static
     * @param {string} key Storage key
     * @returns {Promise}
     */
    static restore(key) {
        if (typeof(key) !== "string") {
            key = this.className;
        }

        const lastChar = key.slice(-1);
        const itemsPath = Model.getItemsPath(key);

        return new Promise((resolve, reject) => {
            if (itemsPath !== null && lastChar === "*") {
                storageProvider.getItem(itemsPath).then((itemKeysJson) => {
                    if (itemKeysJson === undefined || itemKeysJson === null) {
                        resolve([]);
                    }

                    const itemKeys = JSON.parse(itemKeysJson);
                    const itemsPromises = [];
                    itemKeys.forEach((item) => {
                        itemsPromises.push(storageProvider.getItem(item));
                    });

                    return Promise.all(itemsPromises);
                }).then((itemsSerialized) => {
                    const itemsDeserialized = [];
                    itemsSerialized.forEach((item) => {
                        itemsDeserialized.push(Model.deserialize(item));
                    });

                    resolve(itemsDeserialized);
                }).catch((error) => {
                    reject(error);
                });
            } else {
                storageProvider.getItem(key).then((data) => {
                    if (data === null) {
                        resolve(null);
                    } else {
                        const deserialized = Model.deserialize(data);
                        resolve(deserialized);
                    }
                }).catch((error) => {
                    reject(error);
                });
            }
        });
    }

    /**
     * Remove element from storage and related value in _items array.
     * @param  {string} key
     * @return {Promise}
     */
    static remove(key) {
        if (typeof(key) !== "string") {
            key = this.className;
        }

        const itemsPath = Model.getItemsPath(key);
        return new Promise((resolve, reject) => {
            storageProvider.removeItem(key).then(() => {
                if (itemsPath === null) {
                    resolve();
                } else {
                    return storageProvider.getItem(itemsPath);
                }
            }).then((itemsJson) => {

                if (itemsJson === undefined || itemsJson === null) {
                    resolve();
                }

                const items = JSON.parse(itemsJson);
                const itemIndex = items.indexOf(key);

                if (itemIndex !== -1) {
                    items.splice(itemIndex, 1);
                }

                if (items.length === 0) {
                    return storageProvider.removeItem(itemsPath);
                } else {
                    return storageProvider.setItem(items, JSON.stringify(items));
                }
            }).then(() => {
                resolve();
            });
        });
    }

    static get _storageProvider() {
        return storageProvider;
    }
}
