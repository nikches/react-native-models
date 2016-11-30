import ModelBase from "../../ModelBase";

export default class TestModel extends ModelBase {
    static get className() {
        return "TestModel";
    }

    constructor(number = 0, string = "", boolean = false, object = {}, array = []) {
        super({
            number:    "Number",
            string:    "String",
            boolean:   "Boolean",
            object:    "Object",
            array:     "Array",
            modelBase: "ModelBase",
        });

        this.setNumber(number);
        this.setString(string);
        this.setBoolean(boolean);
        this.setObject(object);
        this.setArray(array);
        this.setModelBase(new ModelBase());
    }
}
