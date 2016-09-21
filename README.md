# filejson
Use a JSON file to automatically save a JavaScript object to disk whenever it changes.

## Requirements
Node.js >= 6

Node.js version 6 introduces support for [ES6 Proxies](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) which is key for this working so eloquently. Other non-Proxy based solutions out there require function calls each time you wish to save. Unlike those filejson is as easy as file.contents = ```"my new value"``` or ```file.contents = {"msg": "Hello World"}``` and the changes are automatically saved to disk.

If you need to get this working with an older version of Node.js, you may be able to with a polyfill such as [GoogleChrome/proxy-polyfill](https://github.com/GoogleChrome/proxy-polyfill) but I haven't tried it.

## Install
```javascript
npm install filejson --save
```

## Example
```javascript
var Filejson = require("filejson");
var file1 = new Filejson();

file1.load("file1.json", proceed); // assuming file1.json contains {"abc": "123"}

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

All operations happen asynchronously and operations are throttled to prevent a race condition.
