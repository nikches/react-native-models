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
            if (Model._isOwnProperty(propertyName, properties) === false) {
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
     * Create state object, equivalent this model.
     *
     * @returns {object} state
     */
    createState() {
        const state = Object.create(null);

        for (const propertyName in this) {
            if (Model._isOwnProperty(propertyName, this) === false) {
                continue;
            }

            if (propertyName.charAt(0) !== "_") {
                continue;
            }

            const statePropery = propertyName.slice(1);
            state[statePropery] = this[propertyName];
        }

        return state;
    }

    /**
     * Populate members of the model from state.
     *
     * @param {object} state state
     */
    populateFromState(state) {
        for (const propertyName in state) {
            if (Model._isOwnProperty(propertyName, state) === false) {
                continue;
            }

            const privatePropertyName = "_" + propertyName;

            if (!(privatePropertyName in this)) {
                throw new Error("Property " + propertyName + " does not exists in " + this.constructor.name + ".");
            }

            this[privatePropertyName] = state[propertyName];
        }
    }

    /**
     * Create new instance of the model from givent state.
     *
     * @static
     * @param {object} state
     * @param {object} properties
     * @return {Model}
     */
    static fromState(state, properties) {
        const className = this.name;

        if (!(className in Model.classConstructors)) {
            throw new Error("Unknow class. Use Model.require(" + className + ")");
        }

        const classConstructor = Model.classConstructors[className];
        const model = new classConstructor(properties);
        model.populateFromState(state);
        return model;
    }

    static _isOwnProperty(propertyName, object) {
        return Object.prototype.hasOwnProperty.apply(object, [propertyName]);
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
        if (value === undefined) {               
            if (requiredType === "Undefined") {
                return true;
            } else {
                return false;
            }
        }

        if (value === null && requiredType === "Object") {
            return true;
        }

        if (value.constructor === undefined) {
            const matches = Object.prototype.toString.call(value).match(/\[object (.+)\]/);
            return matches !== null && matches[1] === requiredType;
        }

        return value.constructor.name === requiredType;
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
            if (Model._isOwnProperty(key, object) === false) {
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
            throw new Error("Unknow class. Use Model.require(" + className + ")");
        }

        const instance = new Model.classConstructors[className]();
        const data = container["data"];

        for (const key in data) {
            if (Model._isOwnProperty(key, data) === false) {
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

        return Model._checkType(value, "Object") || Model._checkType(value, "Array");
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
                if (Model._isOwnProperty(key, iterable) === false) {
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

    static require(classConstructor) {
        if (classConstructor in Model.classConstructors) {
            throw new Error(classConstructor.name + " alredy using.");
        }

        Model.classConstructors[classConstructor.name] = classConstructor;
    }
}

Model.classConstructors = Object.create(null);
