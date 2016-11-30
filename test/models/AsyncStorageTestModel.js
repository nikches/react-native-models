import Model            from "../../Model";
import ModelBase        from "../../ModelBase";
import AsyncStorageMock from "./AsyncStorageMock";

export default class AsyncStorageTestModel extends Model {
    static get className() {
        return "AsyncStorageTestModel";
    }

    constructor(number = 0, string = "", boolean = false, object = {}, array = []) {
        super({
            number:    "Number",
            string:    "String",
            boolean:   "Boolean",
            object:    "Object",
            array:     "Array",
            modelBase: "ModelBase",
        }, AsyncStorageMock);

        this.setNumber(number);
        this.setString(string);
        this.setBoolean(boolean);
        this.setObject(object);
        this.setArray(array);
        this.setModelBase(new ModelBase());
    }
}
