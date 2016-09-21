# [filejson](https://github.com/bchr02/filejson)
Use a JSON file to automatically save a JavaScript object to disk whenever it changes.

## Requirements
[ECMAScript 6 Reflect and Proxy objects](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)  support, which is found natively in Node.js >= 6. If you are using a version of Node.js < 6, use a polyfill, such as [harmony-reflect](https://github.com/tvcutsem/harmony-reflect). Proxy support is key for this module working so eloquently. Other non-Proxy based modules require function calls each time you wish to save an object. Unlike those, [filejson](https://github.com/bchr02/filejson) is as easy as ```file.contents = "my new value"``` or ```file.contents = {"msg": "Hello World"}``` and the changes are automatically saved to disk.

## Install (Node.js >= 6)
```javascript
npm install filejson --save
```

## Install (Node.js < 6)
If you are using a version of Node.js < 6 then you will also need to install a polyfill such as [harmony-reflect](https://github.com/tvcutsem/harmony-reflect):
```
npm install harmony-reflect --save
npm install filejson --save
```
And then when you want to run your app you will need to use the node --harmony_proxies flag:
```
node --harmony_proxies index.js
```

## Example usage
```javascript
var Filejson = require("filejson");
var file1 = new Filejson();

file1.load("file1.json", proceed); // file1.json contains {"abc": "123"}

function proceed(error, file) {
    if(error) {
        console.error(error);
        return;
    }

    console.log(file.contents); // outputs {"abc": "123"}

    file.contents.msg = "Hello World"; // saves {"abc": "123", "msg": "Hello World"} to file1.json.

    console.log(file.contents); // outputs {"abc": "123", "msg": "Hello World"}

}
```

All operations happen asynchronously and operations are throttled to prevent a fs.writeFile race condition.
