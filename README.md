# react-native-models
Implementation of the models for React Native.

## Features
- serialization/deserialization and saving of models in AsyncStorage;
- support of nested models;
- setters/getters for model's properties;
- verification of property types;
- filling models from the state;
- path like syntax for keys;
- serialization/deserialization of Date and RegExp objects not supported yet. Instead of it should be used strings.

## Methods

### constructor

```javascript
constructor(properties: object): Model
```

Create instance of Model. Properties is a plain object:

```javascript
{
    number:    "Number",
    string:    "String",
    boolean:   "Boolean",
    object:    "Object",
    array:     "Array",
    modelBase: "Model",
}
```

### store

```javascript
store(key?:string): Promise
```

Save model in `Storage`. This method serialize model and all nested models. If key doesn't specified used `className` property. Key support path syntax. For example:

```javascript
/book/0
/book/1
/book/2
```

### restore

```javascript
static restore(key?:string): Promise
```

Restore model from `Storage`. If key doesn't specified using `className` property. If store models with keys `/book/0` and `/book/1`, possible to restore them by `/book/*` key.

### remove

```javascript
static remove(key?:string): Promise
```

Remove value from `Store` and related record in `_items` record.

### serialize

```javascript
serialize(): string
```

Serialize object.

### deserialize

```javascript
static deserialize(): Model
```

Deserialize object from string.

### populateFromState

```javascript
populateFromState(state: object)
```

Fill model's properties from given state.

### fromState

```javascript
static fromState(state: object): Model
```

Create new instance of `Model`. This method check type whenever set model's property.

### require

```javascript
static require(constructor: Model)
```

Bind class name with its constructor. Need for deserialization.

## Examples

### Properties

```javascript
import Model from "react-native-models";

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
```

### Store/restore

```javascript
const myModel = new MyModel();
myModel.setA(10);
myModel.store().then(() => {
    // ok
}).catch((error) => {
    // handle error
});

MyModel.restore().then((myModel) => {
    // ok
}).catch((error) => {
    // handle error
});
```

### Store/restore (path like syntax)

```javascript
const myModel = new MyModel(1, "My model");
const anotherModel = new MyModel(2, "Another model");

myModel.store("/myModel").then(() => {
    return anotherModel.store("/anotherModel");
}).then(() => {
    MyModel.require(MyModel);
    return MyModel.restore("/*");
}).then((models) => {
    const myModel = models[0];
    const anotherModel = model[1];

    // myModel.getA() === 1
    // myModel.getB() === "My model"

    // anotherModel.getA() === 2
    // anotherModel.getB() === "Another model"
});
```

### Filling state

```javascript
import React from "react";
import Model from "react-native-models";
import MyModel from "./MyModel";

export default class MyComponent extends React.Component {
    constructor(props) {
        super(props);
        // Use default values of model
        this.state = (new MyModel()).createState();
    }

    componentWillMount() {
        // Required for instancing of models objects.
        MyModel.require(MyModel);

        MyModel.restore().then((myModel) => {
            if (myModel!== null) {
                this.setState(myModel.createState());
            }
        }).catch((error) => {
            // error handling
        });
    }
}
```

### Serialization/deserialization

```javascript
const myModel = new MyModel();
const serialized = myModel.serialize();
const myModel2 = MyModel.deserialize(serialized);
```

## Testing

```
echo '{ "presets": ["es2015"] }' > .babelrc
npm test
```

## License

[MIT](https://opensource.org/licenses/MIT)
