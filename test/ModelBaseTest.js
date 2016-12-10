import Assert from "assert";
import ModelBase from "../ModelBase";
import TestModel from "./models/TestModel";
/* global describe */
/* global it */
/* global before */

describe("ModelBase", () => {
    describe("constructor", () => {
        it("should create correct properties for model", () => {
            const testModel = new TestModel(42);
            Assert.equal(testModel._number, 42);
        });

        it("should throw error if properties beginning by underscore", () => {
            Assert.throws(() => {
                const modelBase = new ModelBase({
                    _property: "Number"
                });
            });
        });

        it("should throw error if property type is not a \"String\"", () => {
            Assert.throws(() => {
                const modelBase = new ModelBase({
                    property: 0,
                });
            });
        });
    });

    describe("_checkType", () => {
        it("should return true if passed correct type", () => {
            Assert.equal(ModelBase._checkType(1,                     "Number"    ),   true);
            Assert.equal(ModelBase._checkType(false,                 "Boolean"   ),   true);
            Assert.equal(ModelBase._checkType("string",              "String"    ),   true);
            Assert.equal(ModelBase._checkType(() => {},              "Function"  ),   true);
            Assert.equal(ModelBase._checkType({},                    "Object"    ),   true);
            Assert.equal(ModelBase._checkType([],                    "Array"     ),   true);
            Assert.equal(ModelBase._checkType(Object.create(null),   "Object"    ),   true);
            Assert.equal(ModelBase._checkType(new Date(),            "Date"      ),   true);
            Assert.equal(ModelBase._checkType(new RegExp(),          "RegExp"    ),   true);
            Assert.equal(ModelBase._checkType(new ModelBase(),       "ModelBase" ),   true);
            Assert.equal(ModelBase._checkType(new TestModel(),       "TestModel" ),   true);
            Assert.equal(ModelBase._checkType(undefined,             "Undefined" ),   true);
            Assert.equal(ModelBase._checkType(null,                  "Null"      ),   true);
            Assert.equal(ModelBase._checkType(new Number(1),         "Number"    ),   true);
            Assert.equal(ModelBase._checkType(new String("test"),    "String"    ),   true);
            Assert.equal(ModelBase._checkType(new Boolean(false),    "Boolean"   ),   true);
            Assert.equal(ModelBase._checkType(new Function("return 0"), "Function"),  true);
            Assert.equal(ModelBase._checkType(undefined,             undefined   ),   false);
        });
    });

    describe("setter", () => {
        it("should set property value", () => {
            const testModel = new TestModel();

            Assert.doesNotThrow(() => {
                testModel.setNumber(0);
                testModel.setString("string");
                testModel.setBoolean(false);
                testModel.setObject({});
                testModel.setArray([]);
                testModel.setModelBase(new ModelBase());
            });
        });

        it("should throw error if passed value of incorrect type", () => {
            const testModel = new TestModel();
            Assert.throws(() => {
                testModel.setNumber("1");
            });
        });
    });

    describe("getter", () => {
        it("should return correct value", () => {
            const testModel = new TestModel();
            Assert.equal(testModel.getNumber(), 0);

            const modelBase = new ModelBase({
                number: "Number",
            });

            Assert.equal(modelBase.getNumber(), null);
        });
    });

    describe("createState", () => {
        it("should create state according to model's properties", () => {
            const testModel = new TestModel();
            const state = testModel.createState();

            Assert.equal   (state.unknow, undefined);
            Assert.notEqual(state.number, undefined);
            Assert.notEqual(state.string, undefined);
            Assert.notEqual(state.object, undefined);
        });
    });

    describe("populateFromState", () => {
        it("should correct read values of properties", () => {
            const testModel = new TestModel();

            const state = {
                number: 0,
                string: "string",
                object: {
                    a: 0,
                    b: false,
                    c: "",
                }
            };

            testModel.populateFromState(state);

            Assert.equal(testModel.getNumber(), state.number);
            Assert.equal(testModel.getString(), state.string);

            const testModelObject = testModel.getObject();
            for (const key in testModelObject) {
                Assert.equal(testModelObject[key], state.object[key]);
            }
        });

        it("should throw exception if state has unknown property", () => {
            const testModel = new TestModel();
            const state = {
                unknownProperty: 0
            };

            Assert.throws(() => {
                testModel.populateFromState(state);
            });
        });

        it("should throw exception if state has invalid property's type", () => {
            const testModel = new TestModel();
            const state = {
                number: "invalid value",
            };

            Assert.throws(() => {
                testModel.populateFromState(state);
            });
        });
    });

    describe("_isObjectOrArray", () => {
        it("should correct distinguish an array and object from string, number, boolean or other not plain object", () => {
            Assert.equal(ModelBase._isObjectOrArray({}),              true);
            Assert.equal(ModelBase._isObjectOrArray([]),              true);
            Assert.equal(ModelBase._isObjectOrArray(new Object()),    true);
            Assert.equal(ModelBase._isObjectOrArray(new Array()),     true);

            Assert.equal(ModelBase._isObjectOrArray(new ModelBase()), false);
            Assert.equal(ModelBase._isObjectOrArray(new Date()),      false);
            Assert.equal(ModelBase._isObjectOrArray(new RegExp()),    false);
            Assert.equal(ModelBase._isObjectOrArray(new Number()),    false);
            Assert.equal(ModelBase._isObjectOrArray(new Boolean()),   false);
            Assert.equal(ModelBase._isObjectOrArray(new String()),    false);
            Assert.equal(ModelBase._isObjectOrArray(0),               false);
            Assert.equal(ModelBase._isObjectOrArray("string"),        false);
            Assert.equal(ModelBase._isObjectOrArray(false),           false);
        });
    });

    describe("fromState", () => {
        it("should instance new Model from given state", () => {
            const state = {
                number:    1,
                string:    "string",
                boolean:   true,
                object:    { a: 1 },
                array:     [ 1 ],
                modelBase: new ModelBase(),
            };

            const testModel = TestModel.fromState(state);
        });
    });

    describe("_serialize", () => {
        const testModel = new TestModel();

        testModel.setNumber(-3.14);
        testModel.setBoolean(true);
        testModel.setString("string");
        testModel.setObject({
            number: 0,
            string: "string",
            object: Object.create(null),
            array: []
        });
        testModel.setArray([
            0, "string", {}, []
        ]);

        testModel.setModelBase(new ModelBase());

        const serialized = TestModel._serialize(testModel);

        Assert.notEqual(serialized[TestModel._classNameKey], undefined);
        Assert.notEqual(serialized["data"], undefined);

        const data = serialized["data"];
        Assert.equal(Math.abs(data["_number"] + 3.14) < Number.EPSILON, true);
        Assert.equal(data["_boolean"], true);
        Assert.equal(data["_string"], "string");

        const dataObject = data["_object"];
        Assert.equal(dataObject["number"], 0);
        Assert.equal(dataObject["string"], "string");
        Assert.equal(ModelBase._checkType(dataObject["object"], "Object"), true);
        Assert.equal(Array.isArray(dataObject["array"]), true);

        const dataArray = data["_array"];
        Assert.equal(dataArray[0], 0);
        Assert.equal(dataArray[1], "string");
        Assert.equal(ModelBase._checkType(dataArray[2], "Object"), true);
        Assert.equal(ModelBase._checkType(dataArray[3], "Array"),  true);

        const dataModel = data["_modelBase"];
        Assert.notEqual(dataModel[ModelBase._classNameKey], undefined);
        Assert.notEqual(dataModel["data"], undefined);
    });

    describe("_deserialize", () => {
        TestModel.require(TestModel);
        TestModel.require(ModelBase);
        let testModel = new TestModel();

        let nestedModel = new ModelBase({
            number: "Number",
        });

        testModel.setNumber(42);
        nestedModel.setNumber(42);
        testModel.setModelBase(nestedModel);

        const serialized = testModel.serialize();
        const deserialized = TestModel.deserialize(serialized);

        Assert.equal(deserialized.getNumber(), 42);
        nestedModel = deserialized.getModelBase();
        Assert.equal(nestedModel._number, 42);
    });
});
