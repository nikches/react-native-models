import { AsyncStorage } from "react-native";

export default class Model {
    static get _classNameKey() {
        return "__REACT_NATIVE_MODELS_CLASS_NAME__";
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
            if (object.hasOwnProperty(key) === false) {
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
            if (data.hasOwnProperty(key) === false) {
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

        if (action === "serialization" && scalar instanceof Model) {
            return Model._serialize(scalar);
        }

        if (action === "deserialization" && scalar[Model._classNameKey]) {
            return Model._deserialize(scalar);
        }

        return scalar;
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
                if (iterable.hasOwnProperty(key) === false) {
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
