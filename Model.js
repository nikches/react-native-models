import Storage from "NullStorage";

export default class Model {
    static get _idKey () {
        return "__REACT_NATIVE_MODELS_ID__";
    }

    static get _classNameKey() {
        return "__REACT_NATIVE_MODELS_CLASS_NAME__";
    }

    constructor() {
    }

    _serializeScalar(scalar) {
        if (scalar instanceof Model) {
            return this._serialize(scalar);
        } else {
            return scalar;
        }
    }

    _serializeIterable(iterable) {
        let data = null;

        if (iterable instanceof Object) {
            data = Object.create(null);
            for (const key in iterable) {
                const value = iterable[key];
                if (value[Symbol.iterator]) {
                    data[key] = this._serializeIterable(value);
                } else {
                    data[key] = this._serializeScalar(value);
                }
            }
        } else {
            data = new Array();
            for (let i = 0; i < iterable.length; i++) {
                const value = iterable[i];
                if (value[Symbol.iterator]) {
                    data.push(this._serializeIterable(value));
                } else {
                    data.push(this._serializeScalar(value));
                }
            }
        }
        return data;
    }

    _serialize(object) {
        const container = Object.create(null);
        container[Model._classNameKey] = object.constructor.name;

        const data = Object.create(null);
        for (const key in this) {
            const value = this[key];
            if (typeof(value) === "function") {
                continue;
            }

            if (value[Symbol.iterator]) {
                data[key] = this._serializeIterable(value);
            } else {
                data[key] = this._serializeScalar(value);
            }
        }

        container["data"] = data;
        return container;
    }

    serialize() {
    }

    deserialize() {
    }

    static deserializeSingleton() {

    }
}
