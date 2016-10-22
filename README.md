# [filejson](https://github.com/bchr02/filejson)

[![NPM](https://nodei.co/npm/filejson.png?downloads=true&stars=true)](https://nodei.co/npm/filejson/)

Seamlessly sync a JavaScript value to a JSON encoded file automatically in the background whenever that value changes. A value can be a Javascript: string, number, boolean, null, object, or an array. The value can be structured in an array or an object to allow for more complex data stores. These structures can also be nested. As a result, you can use this module as a simple document store for storing semi structured data.

## Requirements
[ECMAScript 6 Reflect and Proxy objects](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)  support, which is found natively in Node.js >= 6. If you are using a version of Node.js < 6, use a polyfill, such as [harmony-reflect](https://github.com/tvcutsem/harmony-reflect). Proxy support is key for this module working so eloquently. Other non-Proxy based modules require function calls each time you wish to save an object. Unlike those, [filejson](https://github.com/bchr02/filejson) is as easy as ```file.contents = "my new value"``` or ```file.contents = {"msg": "Hello World"}``` and the changes are automatically saved to disk.

## Installation

```javascript
npm install filejson --save
```
[If you are using Node.js 5 or earlier, some additional installation and usage steps are needed. Click here.](#additional-installation-and-usage-steps-for-those-using-nodejs-5-or-earlier)

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

## Additional installation and usage steps for those using Node.js 5 or earlier

* You will need a polyfill such as [harmony-reflect](https://github.com/tvcutsem/harmony-reflect):
```
npm install harmony-reflect --save
```
* In addition to requiring filejson, you will need to require harmony-reflect at the top of your app, like this:
```javascript
var Reflect = require('harmony-reflect');
```
* Lastly, every time you run your app you will need to use the node --harmony_proxies flag, like this:
```
node --harmony_proxies index.js
```
