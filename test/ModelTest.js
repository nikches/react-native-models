import Assert from "assert";
import AsyncStorageTestModel from "./models/AsyncStorageTestModel";
import AsyncStorageMock from "./models/AsyncStorageMock";
/* global describe */
/* global it */

describe("Model", () => {
    describe("constructor", () => {
        it("should create instance of Model with AsyncStorageMock provider", () => {
            const model = new AsyncStorageTestModel();
            Assert.equal(AsyncStorageMock.name, "AsyncStorageMock");
        });
    });

    describe("store", () => {
        it("should correct storing values and shouldn't create index", () => {
            const model = new AsyncStorageTestModel();
            Assert.equal(model.getNumber(), 0);
            model.store().then(() => {});

            Assert.equal("AsyncStorageTestModel" in AsyncStorageTestModel._storageProvider.items, true);
            AsyncStorageTestModel._storageProvider.clear();
            Assert.equal("AsyncStorageTestModel" in AsyncStorageTestModel._storageProvider.items, false);
        });

        it("should throwing an error if key ending at \"/\" or \"*\"", () => {
            const model = new AsyncStorageTestModel();
            Assert.throws(() => {
                model.store("key/");
            });

            Assert.throws(() => {
                model.store("key/*");
            });

            AsyncStorageTestModel._storageProvider.clear();
        });

        it("should create index of value if key beginning at \"/\"", (done) => {
            const model = new AsyncStorageTestModel();
            model.store("/a").then(() => {
                return model.store("/b");
            }).then(() => {
                return model.store("/a/1");
            }).then(() => {
                return model.store("/a/2");
            }).then(() => {
                let items = AsyncStorageTestModel._storageProvider.items["/_items"];
                ["/a", "/b"].forEach((item) => {
                    if (items.indexOf(item) === -1) {
                        done(new TypeError("Incorrect values in index."));
                    }
                });

                items = AsyncStorageTestModel._storageProvider.items["/a/_items"];
                ["/a/1", "/a/2"].forEach((item) => {
                    if (items.indexOf(item) === -1) {
                        done(new TypeError("Incorrect values in index."));
                    }
                });

                AsyncStorageTestModel._storageProvider.clear();
                done();
            }).catch((error) => {
                done(error);
            });
        });
    });

    describe("restore", () => {
        it("should correct restoring single value from storage", (done) => {
            AsyncStorageTestModel.require(AsyncStorageTestModel);

            const model = new AsyncStorageTestModel();
            model.store("/a").then(() => {
                return model.store("/a/1");
            }).then(() => {
                return model.store("/a/2");
            }).then(() => {
                return AsyncStorageTestModel.restore("/a/2");
            }).then((value) => {
                if ((value instanceof AsyncStorageTestModel) === false) {
                    done(new Error(`Value should be instance of AsyncStorageTestModel but given ${value}`));
                }

                if (value.getNumber() !== 0) {
                    done(new Error("Value should have number property equal 0."));
                }

                AsyncStorageTestModel._storageProvider.clear();
                done();
            }).catch((error) => {
                done(error);
            });
        });

        it("should correct restore multiple values from storage", (done) => {
            AsyncStorageTestModel.require(AsyncStorageTestModel);

            const modelA = new AsyncStorageTestModel(1, "A");
            const modelB = new AsyncStorageTestModel(2, "B");
            const modelC = new AsyncStorageTestModel(3, "C");

            modelA.store("/a").then(() => {
                return modelB.store("/b");
            }).then(() => {
                return modelC.store("/c");
            }).then(() => {
                return modelC.store("/a/b/c");
            }).then(() => {
                return AsyncStorageTestModel.restore("/*");
            }).then((items) => {
                if (AsyncStorageTestModel._checkType(items, "Array") === false) {
                    done(new TypeError("Array expected"));
                }

                const modelA = items[0];
                const modelB = items[1];
                const modelC = items[2];

                if (modelA.getNumber() !== 1 || modelA.getString() !== "A") {
                    done(new Error("Incorrect properties of modelA."));
                }

                if (modelB.getNumber() !== 2 || modelB.getString() !== "B") {
                    done(new Error("Incorrect properties of modelB."));
                }

                if (modelC.getNumber() !== 3 || modelC.getString() !== "C") {
                    done(new Error("Incorrect properties of modelC."));
                }

                AsyncStorageTestModel._storageProvider.clear();
                done();
            }).catch((error) => {
                done(error);
            });
        });
    });

    describe("remove", () => {
        it("should correct remove values from storage", (done) => {
            AsyncStorageTestModel.require(AsyncStorageTestModel);

            const model = new AsyncStorageTestModel();
            model.store("/a").then(() => {
                const items = AsyncStorageTestModel._storageProvider.items["/_items"];
                if (!("/a" in AsyncStorageTestModel._storageProvider.items)) {
                    done(new Error("Model should create index value."));
                }

                return AsyncStorageTestModel.remove("/a");
            }).then(() => {
                const items = AsyncStorageTestModel._storageProvider.items["/_items"];
                if (items !== undefined) {
                    done(new Error("Model should removing index if current path doesn't contains values."));
                }

                if ("/a" in AsyncStorageTestModel._storageProvider.items) {
                    done(new Error("Model should removing keky from index."));
                }

                done();
            }).catch((error) => {
                done(error);
            });
        });
    });
});