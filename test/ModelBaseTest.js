import Assert from "assert";
import Model  from "../ModelBase";
/* global describe */
/* global it */

describe("ModelBase", () => {
    describe("constructor", () => {
        it("should create correct properties for model", () => {
            const model = new Model({
                "": "Number",
                numberProperty: "Number",
                stringProperty: "String",
                booleanProperty: "Boolean",
                objectProperty: "Object",
            });
        });

        it("should throw error if properties beginning by underscore", () => {
            Assert.throws(() => {
                const model = new Model({
                    _property: "Number"
                });
            });
        });
    });

    describe("_checkType", () => {
        it("should return true if passed correct type", () => {
            Assert.equal(Model._checkType(1,            "Number"),   true);
            Assert.equal(Model._checkType(false,        "Boolean"),  true);
            Assert.equal(Model._checkType("string",     "String"),   true);
            Assert.equal(Model._checkType(() => {},     "Function"), true);
            Assert.equal(Model._checkType({},           "Object"),   true);
            Assert.equal(Model._checkType([],           "Array"),    true);
            Assert.equal(Model._checkType(null,         "Object"),   true);
            Assert.equal(Model._checkType(new Date(),   "Date"),     true);
            Assert.equal(Model._checkType(new RegExp(), "RegExp"),   true);
            Assert.equal(Model._checkType(new Model(),  "Model"),    true);

            Assert.throws(() => {
                Model._checkType(undefined, "undefined", false);
            });
        });
    });

    describe("setter", () => {
        it("should set property value", () => {
            const model = new Model({
                numberProperty: "Number",
                stringProperty: "String",
                objectProperty: "Object",
            });

            Assert.doesNotThrow(() => {
                model.setNumberProperty(0);
                model.setStringProperty("string");
                model.setObjectProperty({});
            });
        });

        it("should throw error if passed value of incorrect type", () => {
            const model = new Model({
                numberProperty: "Number",
            });

            Assert.throws(() => {
                model.setNumberProperty("1");
            });
        });
    });

    describe("getter", () => {
        it("should return correct value", () => {
            const model = new Model({
                numberProperty: "Number",
            });

            Assert.equal(model.getNumberProperty(), null);
            model.setNumberProperty(0);
            Assert.equal(model.getNumberProperty(), 0);
        });
    });

    describe("createState", () => {
        it("should create state according model's properties", () => {
            const model = new Model({
                numberProperty: "Number",
                stringProperty: "String",
                objectProperty: "Object",
            });

            model.setNumberProperty(0);
            model.setStringProperty("string");
            model.setObjectProperty({});

            const state = model.createState();

            Assert.equal(state.unknowProperty,    undefined);
            Assert.notEqual(state.numberProperty, undefined);
            Assert.notEqual(state.stringProperty, undefined);
            Assert.notEqual(state.objectProperty, undefined);
        });
    });

    describe("populateFromState", () => {
        it("should correct read values of properties", () => {
            const model = new Model({
                numberProperty: "Number",
                stringProperty: "String",
                objectProperty: "Object",
            });

            const state = {
                numberProperty: 0,
                stringProperty: "string",
                objectProperty: {
                    a: 0,
                    b: 1,
                    c: "string",
                }
            };

            model.populateFromState(state);
            Assert.equal(model.getNumberProperty(), state.numberProperty);
            Assert.equal(model.getStringProperty(), state.stringProperty);

            const objectProperty = model.getObjectProperty();
            for (const key in objectProperty) {
                Assert.equal(objectProperty[key], state.objectProperty[key]);
            }

            state["unknowProperty"] = 0;

            Assert.throws(() => {
                model.populateFromState(state);
            });
        });
    });

    describe("_isObjectOrArray", () => {
        it("should correct distinguish an array and object from string, number, boolean or other not plain object", () => {
            Assert.equal(Model._isObjectOrArray({}),            true);
            Assert.equal(Model._isObjectOrArray([]),            true);
            Assert.equal(Model._isObjectOrArray(new Object()),  true);
            Assert.equal(Model._isObjectOrArray(new Array()),   true);

            Assert.equal(Model._isObjectOrArray(new Model()),   false);
            Assert.equal(Model._isObjectOrArray(new Date()),    false);
            Assert.equal(Model._isObjectOrArray(new RegExp()),  false);
            Assert.equal(Model._isObjectOrArray(new Number()),  false);
            Assert.equal(Model._isObjectOrArray(new Boolean()), false);
            Assert.equal(Model._isObjectOrArray(new String()),  false);
            Assert.equal(Model._isObjectOrArray(0),             false);
            Assert.equal(Model._isObjectOrArray("string"),      false);
            Assert.equal(Model._isObjectOrArray(false),         false);
        });
    });

    describe("fromState", () => {
        it("should instance new Model from given state", () => {
            const state = {
                numberProperty: 0,
                stringProperty: "string",
                objectProperty: {
                    a: 0,
                    b: 1,
                    c: "string",
                }
            };

            Model.require(Model);

            const model = Model.fromState(state, {
                numberProperty: "Number",
                stringProperty: "String",
                objectProperty: "ObjectProperty",
            });

            Assert.equal(model.getNumberProperty(), 0);
            Assert.equal(model.getStringProperty(), "string");

            const objectProperty = model.getObjectProperty();
            for (const key in objectProperty) {
                Assert.equal(objectProperty[key], state.objectProperty[key]);
            }
        });
    });

    describe("_serialize", () => {
        const model = new Model({
            numberProperty: "Number",
            booleanProperty: "Boolean",
            stringProperty: "String",
            objectProperty: "Object",
            arrayProperty: "Array",
            array2Property: "Array",
            modelProperty: "Model",
        });

        model.setNumberProperty(-3.14);
        model.setBooleanProperty(true);
        model.setStringProperty("string");
        model.setObjectProperty({
            number: 0,
            string: "string",
            object: Object.create(null),
            array: []
        });

        model.setArrayProperty([
            0, "string", {}, []
        ]);

        model.setModelProperty(new Model());
        model.setArray2Property(new Array());

        const serialized = Model._serialize(model);
        Assert.notEqual(serialized[Model._classNameKey], undefined);
        Assert.notEqual(serialized["data"], undefined);

        const data = serialized["data"];
        Assert.equal(Math.abs(data["_numberProperty"] + 3.14) < Number.EPSILON, true);
        Assert.equal(data["_booleanProperty"], true);
        Assert.equal(data["_stringProperty"], "string");

        const dataObject = data["_objectProperty"];
        Assert.equal(dataObject["number"], 0);
        Assert.equal(dataObject["string"], "string");
        Assert.equal(Model._checkType(dataObject["object"], "Object"), true);
        Assert.equal(Array.isArray(dataObject["array"]), true);

        const dataArray = data["_arrayProperty"];
        const dataArray2 = data["_array2Property"];
        Assert.equal(dataArray[0], 0);
        Assert.equal(dataArray[1], "string");
        Assert.equal(Model._checkType(dataArray[2], "Object"), true);
        Assert.equal(Model._checkType(dataArray[3], "Array"),  true);

        const dataModel = data["_modelProperty"];
        Assert.notEqual(dataModel[Model._classNameKey], undefined);
        Assert.notEqual(dataModel["data"], undefined);
    });

    describe("_deserialize", () => {
        Model.require(Model);

        let model = new Model({
            numberProperty: "Number",
            booleanProperty: "Boolean",
            stringProperty: "String",
            objectProperty: "Object",
            arrayProperty: "Array",
            array2Property: "Array",
            nestedModelProperty: "Model",
        });

        let nestedModel = new Model({
            numberProperty: "Number",
        });

        model.setNumberProperty(42);
        nestedModel.setNumberProperty(42);
        model.setNestedModelProperty(nestedModel);

        const serialized   = model.serialize();
        const deserialized = Model.deserialize(serialized);

        Assert.equal(deserialized._numberProperty, 42);
        nestedModel = deserialized._nestedModelProperty;
        Assert.equal(nestedModel._numberProperty, 42);
    });
});
