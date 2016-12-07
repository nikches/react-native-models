import Assert from "assert";
import ExampleModel from "./models/ExampleModel";
/* global describe */
/* global it */
/* global before */

describe("ExampleModel", () => {
    describe("constructor", () => {
        it("should create instance of ExampleModel", () => {
            const model = new ExampleModel();
            Assert.equal(model.getA(), 0);
            Assert.equal(model.getB(), "foo");
        });
    });

    describe("test", () => {
        it("should properly set values of model", () => {
            const model = new ExampleModel();
            Assert.equal(model.test(), "exception");
            Assert.equal(model.getA(), 1);
            Assert.equal(model.getB(), "bar");
        });
    });
});