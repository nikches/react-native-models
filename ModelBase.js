export default class ModelBase {
    static get _classNameKey() {
        return "__REACT_NATIVE_MODELS_CLASS_NAME__";
    }

    /**
     * className used instead name because babel replaces him at run-time.
     */
    static get className() {
        return "ModelBase";
    }

    /**
     * Create private properties and getProperty/setProperty methods for them.
     *
     * @param {object} properties propertyName: propertyType
     * @returns {ModelBase}
     */
    constructor(properties) {
        for (const propertyName in properties) {
            if (ModelBase._isOwnProperty(propertyName, properties) === false) {
                continue;
            }

            if (propertyName.charAt(0) === "_") {
                throw new Error("Properties beginning at underscore not supported.");
            }

            const propertyType = properties[propertyName];
            const privatePropertyName = "_" + propertyName;
            const propertyNameCapitalized =
                propertyName.charAt(0).toUpperCase() +
                propertyName.slice(1);

            this[privatePropertyName] = null;
            this["set" + propertyNameCapitalized] = (value) => {
                if (ModelBase._checkType(value, propertyType) === false) {
                    throw new TypeError(`"${propertyName}" is of type "${ModelBase._getTypeName(value)}". Expected "${propertyType}".`);
                }

                this[privatePropertyName] = value;
            };

            this["get" + propertyNameCapitalized] = () => {
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
            if (ModelBase._isOwnProperty(propertyName, this) === false) {
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
        // Create instance of ModelBase which has property's types in closure.
        const constructor = ModelBase._getConstructor(this.constructor.className);
        const typeCheckObject = new constructor();

        for (const propertyName in state) {
            if (ModelBase._isOwnProperty(propertyName, state) === false) {
                continue;
            }

            const privatePropertyName = "_" + propertyName;
            const propertyNameCapitalized =
                propertyName.charAt(0).toUpperCase() +
                propertyName.slice(1);

            if (!(privatePropertyName in this)) {
                throw new Error(`Property "${propertyName}" does not exists in "${this.constructor.className}".`);
            }

            // Should throw exception if type of property is invalid.
            const setter = "set" + propertyNameCapitalized;
            typeCheckObject[setter](state[propertyName]);

            this[privatePropertyName] = state[propertyName];
        }
    }

    /**
     * Create new instance of the model from givent state.
     *
     * @static
     * @param {object} state
     * @param {object} properties
     * @return {ModelBase}
     */
    static fromState(state, properties) {
        const classConstructor = ModelBase._getConstructor(this.className);
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
        return ModelBase._getTypeName(value) === requiredType;
    }

    static _getTypeName(value) {
        if (value === undefined) {
            return "Undefined";
        }

        if (value === null) {
            return "Object";
        }

        if (value.constructor === undefined || value.constructor.className === undefined) {
            const matches = Object.prototype.toString.call(value).match(/\[object (.+)\]/);

            if (matches === null) {
                throw new Error("Unknow type");
            }

            return matches[1];
        }

        return value.constructor.className;
    }

    /**
     * Serialize self.
     *
     * @returns {string} JSON string
     */
    serialize() {
        return JSON.stringify(ModelBase._serialize(this));
    }

    /**
     * Serialize recursively instance of ModelBase.
     *
     * @static
     * @param {ModelBase} object
     * @returns {object}
     */
    static _serialize(object) {
        const container = Object.create(null);
        container[ModelBase._classNameKey] = object.constructor.className;

        const data = Object.create(null);
        for (const key in object) {
            if (ModelBase._isOwnProperty(key, object) === false) {
                continue;
            }

            if (key.charAt(0) !== "_") {
                continue;
            }

            const value = object[key];

            if (ModelBase._isObjectOrArray(value, "serialization")) {
                data[key] = ModelBase._processObjectOrArray(value, "serialization");
            } else {
                data[key] = ModelBase._processScalar(value, "serialization");
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
        return ModelBase._deserialize(JSON.parse(JSONString));
    }

    /**
     * Deserialize instance of ModelBase.
     *
     * @static
     * @param {object} container
     * @return {ModelBase}
     */
    static _deserialize(container) {
        const className = container[ModelBase._classNameKey];

        if (className === undefined) {
            throw new Error("Invalid object");
        }

        const constructor = ModelBase._getConstructor(className);
        const instance = new constructor();
        const data = container["data"];

        for (const key in data) {
            if (ModelBase._isOwnProperty(key, data) === false) {
                continue;
            }

            const value = data[key];

            if (ModelBase._isObjectOrArray(value, "deserialization")) {
                instance[key] = ModelBase._processObjectOrArray(value, "deserialization");
            } else {
                instance[key] = ModelBase._processScalar(value, "deserialization");
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

        if (action === "serialization" && value instanceof ModelBase) {
            return false;
        }

        if (action === "deserialization" && value[ModelBase._classNameKey] !== undefined) {
            return false;
        }

        return ModelBase._checkType(value, "Object") || ModelBase._checkType(value, "Array");
    }

    /**
     * Serialize/deserialize instance of ModelBase, Number, Boolean, String, Date.
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
            if (scalar instanceof ModelBase) {
                return ModelBase._serialize(scalar);
            }

            if (scalar instanceof Date) {
                throw new Error("Serialization of Date objects not supported.");
            }

            if (scalar instanceof RegExp) {
                throw new Error("Serialization of RegExp objects not supported.");
            }
        }

        if (action === "deserialization") {
            if (scalar[ModelBase._classNameKey]) {
                return ModelBase._deserialize(scalar);
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
                if (ModelBase._isObjectOrArray(value, action)) {
                    data.push(ModelBase._processObjectOrArray(value, action));
                } else {
                    data.push(ModelBase._processScalar(value, action));
                }
            }
        } else {
            data = Object.create(null);

            for (const key in iterable) {
                if (ModelBase._isOwnProperty(key, iterable) === false) {
                    continue;
                }

                const value = iterable[key];

                if (ModelBase._isObjectOrArray(value, action)) {
                    data[key] = ModelBase._processObjectOrArray(value, action);
                } else {
                    data[key] = ModelBase._processScalar(value, action);
                }
            }
        }

        return data;
    }

    static require(classConstructor) {
        if (classConstructor in ModelBase.classConstructors) {
            throw new Error(classConstructor.name + " alredy using.");
        }

        ModelBase.classConstructors[classConstructor.name] = classConstructor;
    }

    static _getConstructor(className) {
        if (!(className in ModelBase.classConstructors)) {
            throw new Error("Unknow class. Use ModelBase.require(" + className + ")");
        }

        return ModelBase.classConstructors[className];
    }
}

ModelBase.classConstructors = Object.create(null);
