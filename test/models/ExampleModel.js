import Model from "../../Model";

export default class MyModel extends Model {
    // className used instead name because babel replaces him at run-time.
    static get className() {
        return "MyModel";
    }

    constructor(a = 0, b = "foo", c = new Model()) {
        super({
            a: "Number",
            b: "String",
            c: "Model"   // Nested model
        });

        // Now MyModel has two members
        // this._a === null
        // this._b === null

        this._a = a; // this._a === 0
        this._b = b; // this._b === "foo"
        this._c = c; // this._c === instanceOf Model

        // or with validation of type
        this.setA(a);
        this.setB(b);
        this.setC(c);
    }

    test() {
        this.setA(1);
        this.setB("bar");

        const a = this.getA(); // a === 1
        const b = this.getB(); // b === "bar"

        try {
            this.setA("1");
        } catch (error) {
            return "exception";
        }

        return "no exception";
    }
}