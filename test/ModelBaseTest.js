import Assert from "assert";
import Model  from "../ModelBase";
/* global describe */
/* global it */

describe("ModelBase", () => {
    describe("constructor", () => {
        it("should create correct properties for model", () => {
            const model = new Model({
                "": "number",
                numberProperty: "number",
                stringProperty: "string",
                booleanProperty: "boolean",
                objectProperty: "object",
            });
        });

        it("should throw error if properties beginning by underscore", () => {
            Assert.throws(() => {
                const model = new Model({ _property: "number" });
            });
        });
    });

    describe("_checkType", () => {
        it("should return true if passed correct type", () => {
            Assert.equal(Model._checkType(1,            "number"),   true);
            Assert.equal(Model._checkType(false,        "boolean"),  true);
            Assert.equal(Model._checkType("string",     "string"),   true);
            Assert.equal(Model._checkType(() => {},     "function"), true);
            Assert.equal(Model._checkType({},           "object"),   true);
            Assert.equal(Model._checkType([],           "array"),    true);
            Assert.equal(Model._checkType(new Date(),   "date"),     true);
            Assert.equal(Model._checkType(new RegExp(), "regexp"),   true);
            Assert.equal(Model._checkType(new Model(),  "object"),   true);
        });
    });

    describe("setter", () => {
        it("should set property value", () => {
            const model = new Model({
                numberProperty: "number",
                stringProperty: "string",
                objectProperty: "object",
            });

            Assert.doesNotThrow(() => {
                model.setNumberProperty(0);
                model.setStringProperty("string");
                model.setObjectProperty({});
            });
        });

        it("should throw error if passed value of incorrect type", () => {
            const model = new Model({
                numberProperty: "number",
            });

            Assert.throws(() => {
                model.setNumberProperty("1");
            });
        });
    });

    describe("getter", () => {
        it("should return correct value", () => {
            const model = new Model({
                numberProperty: "number",
            });

            Assert.equal(model.getNumberProperty(), null);
            model.setNumberProperty(0);
            Assert.equal(model.getNumberProperty(), 0);
        });
    });

    describe("createState", () => {
        it("should create state according model's properties", () => {
            const model = new Model({
                numberProperty: "number",
                stringProperty: "string",
                objectProperty: "object",
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
                numberProperty: "number",
                stringProperty: "string",
                objectProperty: "object",
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

            Model.use(Model);

            const model = Model.fromState(state, {
                numberProperty: "number",
                stringProperty: "string",
                objectProperty: "objectProperty",
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
            numberProperty: "numberProperty"
        });

        const serialized = Model._serialize(model);
        Assert.notEqual(serialized[Model._classNameKey], undefined);
        Assert.notEqual(serialized["data"], undefined);
    });

    describe("_deserialize", () => {

    });
});
