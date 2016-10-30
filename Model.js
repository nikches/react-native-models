import Storage from "./NullStorage";

export default class Model {
    static get _classNameKey() {
        return "__REACT_NATIVE_MODELS_CLASS_NAME__";
    }

    _isObjectOrArray(value) {
        return (!(value instanceof Model)) &&
            (Object.prototype.toString.call(value) === "object Object" || Array.isArray(value));
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

        if (Array.isArray(iterable)) {
            data = new Array();
            for (let i = 0; i < iterable.length; i++) {
                const value = iterable[i];
                if (this._isObjectOrArray(value)) {
                    data.push(this._serializeIterable(value));
                } else {
                    data.push(this._serializeScalar(value));
                }
            }
        } else {
            data = Object.create(null);
            for (const key in iterable) {
                const value = iterable[key];

                if (typeof(value) === "function") {
                    continue;
                }

                if (this._isObjectOrArray(iterable)) {
                    data[key] = this._serializeIterable(value);
                } else {
                    data[key] = this._serializeScalar(value);
                }
            }
        }

        return data;
    }

    _serialize(object) {
        const container = Object.create(null);
        container[Model._classNameKey] = object.constructor.name;

        const data = Object.create(null);
        for (const key in object) {
            const value = object[key];

            if (typeof(value) === "function") {
                continue;
            }

            if (this._isObjectOrArray(value)) {
                data[key] = this._serializeIterable(value);
            } else {
                data[key] = this._serializeScalar(value);
            }
        }

        container["data"] = data;
        return container;
    }

    serialize() {
        const serialized = this._serialize(this);
        return JSON.stringify(serialized);
    }

    deserialize() {
    }

    static deserializeSingleton() {

    }
}
