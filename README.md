# react-native-models
[![NPM downloads](http://img.shields.io/npm/dm/react-native-models.svg?style=flat&label=npm%20downloads)](https://npmjs.org/package/react-native-models)
[![npm version](https://badge.fury.io/js/react-native-models.svg)](http://badge.fury.io/js/react-native-models)
[![license](https://img.shields.io/npm/l/react-native-models.svg)](http://licenseit.ru/wiki/index.php/MIT)

Implementation of the models for React Native.

### Features:
- serialization/deserialization and saving of models in AsyncStorage;
- support of nested models;
- setters/getters for model's properties;
- verification of property types;
- filling models from the state;
- serialization/deserialization of Date and RegExp objects not supported yet. Instead, it should be used strings.

### Examples

#### Properties
```javascript
import Model from "react-native-models";

class MyModel extends Model {
    // className used instead name because babel replaces him at run-time.
    static get className() {
        return "MyModel";
    }

    constructor(a = 0, b = "foo") {
        super({
            a: "Number",
            b: "String",
        });

        // Now MyModel has two members
        // this._a === null
        // this._b === null

        this._a = a; // this._a === 0
        this._b = b; // this._b === "foo"

        // or with validation of type
        this.setA(a);
        this.setB(b);
    }

    test() {
        this.setA(1);
        this.setB("bar");

        const a = this.getA(); // a === 1
        const b = this.getB(); // b === "bar"

        try {
          this.setA("1");
        } catch (error) {
          // error handling
        }
    }
}
```

#### Store/restore in AsyncStorage
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
        MyModel.require(MyModel); // Required for instancing of models objects.
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
npm install --save-dev
echo '{ "presets": ["es2015"] }' > .babelrc
npm test
```

### License
[MIT](https://en.wikipedia.org/wiki/MIT_License)
