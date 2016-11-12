import ModelBase        from "./ModelBase";
import { AsyncStorage } from "react-native";

export default class Model extends ModelBase {
    /**
     * Write self in AsyncStorage.
     *
     * @param {string} key AsynStorage key.
     * @return {Promise}
     */
    store(key) {
        if (typeof(key) !== "string") {
            key = this.constructor.className;
        }

        return new Promise((resolve, reject) => {
            const data = this.serialize();

            AsyncStorage.setItem(key, data).then(() => {
                resolve();
            }).catch((error) => {
                reject(error);
            });
        });
    }

    /**
     * Read object from async storage.
     *
     * @static
     * @param {string} key AsyncStorage key
     * @returns {Promise}
     */
    static restore(key) {
        if (typeof(key) !== "string") {
            key = this.className;
        }

        return new Promise((resolve, reject) => {
            AsyncStorage.getItem(key).then((data) => {
                if (data === null) {
                    resolve(null);
                } else {
                    const deserialized = Model.deserialize(data);
                    resolve(deserialized);
                }
            }).catch((error) => {
                reject(error);
            });
        });
    }
}
