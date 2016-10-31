import { AsyncStorage } from "react-native";

export default class Model {
    static get _classNameKey() {
        return "__REACT_NATIVE_MODELS_CLASS_NAME__";
    }

    /**
     * Create private properties and getProperty/setProperty methods for them.
     *
     * @param {object} properties propertyName: propertyType
     * @returns {Model}
     */
    constructor(properties) {
        for (const propertyName in properties) {
            if (Object.prototype.hasOwnProperty.apply(properties, [propertyName]) === false) {
                continue;
            }

            if (propertyName.charAt(0) === "_") {
                throw new Error("Properties beginning at underscore not supported.");
            }

            const propertyType = properties[propertyName];
            const privatePropertyName = "_" + propertyName;
            const propertyNameCapitalize =
                propertyName.charAt(0).toUpperCase() +
                propertyName.slice(1);

            this[privatePropertyName] = null;
            this["set" + propertyNameCapitalize] = (value) => {
                if (Model._checkType(value, propertyType) === false) {
                    throw new TypeError(`${propertyName} is ${propertyType}`);
                }

                this[privatePropertyName] = value;
            };

            this["get" + propertyNameCapitalize] = () => {
                return this[privatePropertyName];
            };
        }
    }

    /**
     * Check type of value and return true if his matches with requiredType.
     *
     * @static
     * @param {any} value
     * @param {string} requiredType
     * @returns {boolean}
     */
    static _checkType(value, requiredType) {
        requiredType = requiredType.toLowerCase();

        const matches = Object
            .prototype
            .toString
            .apply(value)
            .toLowerCase()
            .match(/\[object (.*)\]/);

        if (matches !== null && matches[1] === requiredType) {
            return true;
        }

        return false;
    }

    /**
     * Write self in AsyncStorage.
     *
     * @param {string} key AsynStorage key.
     * @return {Promise}
     */
    store(key) {
        if (typeof(key) !== "string") {
            key = this.constructor.name;
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
            key = this.name;
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

    /**
     * Serialize self.
     *
     * @returns {string} JSON string
     */
    serialize() {
        return JSON.stringify(Model._serialize(this));
    }

    /**
     * Serialize recursively instance of Model.
     *
     * @static
     * @param {Model} object
     * @returns {object}
     */
    static _serialize(object) {
        const container = Object.create(null);
        container[Model._classNameKey] = object.constructor.name;

        const data = Object.create(null);
        for (const key in object) {
            if (Object.prototype.hasOwnProperty.apply(object, [key]) === false) {
                continue;
            }

            if (key.charAt(0) !== "_") {
                continue;
            }

            const value = object[key];

            if (Model._isObjectOrArray(value, "serialization")) {
                data[key] = Model._processObjectOrArray(value, "serialization");
            } else {
                data[key] = Model._processScalar(value, "serialization");
            }
        }

        container["data"] = data;
        return container;
    }

    /**
     * Deserialize JSON string
     *
     * @static
     * @param {string} JSONString
     */
    static deserialize(JSONString) {
        return Model._deserialize(JSON.parse(JSONString));
    }

    /**
     * Deserialize instance of Model.
     *
     * @static
     * @param {object} container
     * @return {Model}
     */
    static _deserialize(container) {
        const className = container[Model._classNameKey];

        if (className === undefined) {
            throw new Error("Invalid object");
        }

        if (!(className in Model.classConstructors)) {
            throw new Error("Unknow class. Use Model.use(" + className + ")");
        }

        const instance = new Model.classConstructors[className]();
        const data = container["data"];

        for (const key in data) {
            if (Object.prototype.hasOwnProperty.apply(data, [key]) === false) {
                continue;
            }

            const value = data[key];

            if (Model._isObjectOrArray(value, "deserialization")) {
                instance[key] = Model._processObjectOrArray(value, "deserialization");
            } else {
                instance[key] = Model._processScalar(value, "deserialization");
            }
        }

        return instance;
    }

    /**
     * Check if value is plain object or array.
     *
     * @static
     * @param {any} value
     * @returns {boolean}
     */
    static _isObjectOrArray(value, action = "serialization") {
        if (value === undefined || value === null) {
            return false;
        }

        if (action === "serialization" && value instanceof Model) {
            return false;
        }

        if (action === "deserialization" && value[Model._classNameKey] !== undefined) {
            return false;
        }

        if (Object.prototype.toString.call(value) === "[object Object]") {
            return true;
        }

        if (Array.isArray(value)) {
            return true;
        }

        return false;
    }

    /**
     * Serialize/deserialize instance of Model, Number, Boolean, String, Date.
     *
     * @static
     * @param {any} scalar
     * @param {string} action One of "serialization" or "deserialization".
     * @returns {any}
     */
    static _processScalar(scalar, action = "serialization") {
        if (scalar === undefined || scalar === null) {
            return scalar;
        }

        if (action === "serialization") {
            if (scalar instanceof Model) {
                return Model._serialize(scalar);
            }

            if (scalar instanceof Date) {
                throw new Error("Serialization of Date objects not supported.");
            }

            if (scalar instanceof RegExp) {
                throw new Error("Serialization of RegExp objects not supported.");
            }
        }

        if (action === "deserialization") {
            if (scalar[Model._classNameKey]) {
                return Model._deserialize(scalar);
            }
        }

        return scalar; /* Number, Boolean, String */
    }

    /**
     * Serialize/deserialization recursively plain object or array.
     *
     * @param {any} iterable object or array
     * @param {string} action One of "serialization" or "deserialization".
     * @returns {any}
     */
    static _processObjectOrArray(iterable, action = "serialization") {
        let data = null;

        if (Array.isArray(iterable)) {
            data = [];
            for (let i = 0; i < iterable.length; i++) {
                const value = iterable[i];
                if (Model._isObjectOrArray(value, action)) {
                    data.push(Model._processObjectOrArray(value, action));
                } else {
                    data.push(Model._processScalar(value, action));
                }
            }
        } else {
            data = Object.create(null);

            for (const key in iterable) {
                if (Object.prototype.hasOwnProperty.apply(iterable, [key]) === false) {
                    continue;
                }

                const value = iterable[key];

                if (Model._isObjectOrArray(value, action)) {
                    data[key] = Model._processObjectOrArray(value, action);
                } else {
                    data[key] = Model._processScalar(value, action);
                }
            }
        }

        return data;
    }

    static use(classConstructor) {
        Model.classConstructors[classConstructor.name] = classConstructor;
    }
}

Model.classConstructors = Object.create(null);
Model.classConstructors["Date"] = Date;
