import { AsyncStorage } from "react-native";

export default class Storage {
    getItem (key, callback) {
        return AsyncStorage(key, callback);
    }

    setItem (key, value, callback) {
        return AsyncStorage(key, value, callback);
    }
}
