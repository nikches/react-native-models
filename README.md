# react-native-models
Implementation of the models for React Native.

### Features:
- serialize/deserialize classes and store them in AsyncStorage;
- setters/getters for properties;
- validation of the property's type.

### Exaples

#### Properties
```javascript
import Model from "../react-native-models/Model";

class MyModel extends Model {
  constructor(a = 0, b = "foo") {
    super({
      a: "number",
      b: "string",
    });
    // Now MyModel has two members
    // this._a === null
    // this._b === null
    
    this._a = a; // this._a === 0
    this._b = b; // this._b === "str"
  }
  
  test() {
    this.setA(1);
    this.setB("bar");
    
    const a = this.getA(); // a === 1
    const b = this.getB(); // b === "foo"
    
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
