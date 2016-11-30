# react-native-models
[![NPM downloads](http://img.shields.io/npm/dm/react-native-models.svg?style=flat&label=npm%20downloads)](https://npmjs.org/package/react-native-models)
[![npm version](https://badge.fury.io/js/react-native-models.svg)](http://badge.fury.io/js/react-native-models)
[![license](https://img.shields.io/npm/l/react-native-models.svg)](https://opensource.org/licenses/MIT)

Implementation of the models for React Native.

### Features:
- serialization/deserialization and saving of models in AsyncStorage;
- support of nested models;
- setters/getters for model's properties;
- verification of property types;
- filling models from the state;
- path like syntax for keys;
- serialization/deserialization of Date and RegExp objects not supported yet. Instead of it should be used strings.

### Methods
```javascript
constructor(properties: object): Model
```

```javascript
store(key?:string): Promise
```

```javascript
static restore(key?:string): Promise
```

```javascript
static remove(key?:string): Promise
```

```javascript
serialize(): string
```

```javascript
static deserialize(): Model
```

```javascript
populateFromState(state: object)
```

```javascript
static fromState(state: object): Model
```

```javascript
static require(constructor: Model)
```

### Examples

#### Properties
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

#### Store/restore
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

#### Store/restore (path like syntax)
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

#### Filling state

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

#### Serialization/deserialization
```javascript
const myModel = new MyModel();
const serialized = myModel.serialize();
const myModel2 = MyModel.deserialize(serialized);
```

### Testing
```
echo '{ "presets": ["es2015"] }' > .babelrc
npm test
```

### License
[MIT](https://opensource.org/licenses/MIT)