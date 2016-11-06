# react-native-models
Implementation of the models for React Native.

### Features:
- serialization/Deserialization and saving of models in AsyncStorage;
- properties of setters/getters for models;
- verification of property types;
- filling models from state.

### Exaples

#### Properties
```javascript
import Model from "react-native-models";

class MyModel extends Model {
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
      } catch (exception) {
        // catch TypeError
      }
  }
}
```

#### Serialization/deserialization
```javascript
const myModel = new MyModel();
const serialized = myModel.serialize();
const myModel2 = MyModel.deserialize(serialized);
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

export default class MyClass extends React.Component {
    constructor(props) {
        super(props);
    }

    componentWillMount() {
        Model.require(Model); // Required for instancing of models objects.

        Model.restore().then((model) => {
            if (model !== null) {
                this.setState(model.createState());
            }
        }).catch((error) => {
            // error handling
        });
    }
}
```

### Testing
```
npm install --save-dev
npm test
```

### License
**MIT**
