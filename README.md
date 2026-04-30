# filejson

[![CI](https://github.com/bchr02/filejson/actions/workflows/ci.yml/badge.svg)](https://github.com/bchr02/filejson/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/filejson.svg)](https://www.npmjs.com/package/filejson)
[![npm downloads](https://img.shields.io/npm/dm/filejson.svg)](https://www.npmjs.com/package/filejson)
[![Node.js Version](https://img.shields.io/node/v/filejson.svg)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Test Coverage](https://img.shields.io/badge/coverage-92%25-brightgreen.svg)](https://github.com/bchr02/filejson)

> **Zero-config automatic JSON file persistence** with atomic writes, debouncing, and crash safety. Just modify objects—changes save automatically!

Seamlessly sync JavaScript values to JSON files in the background. Changes are automatically detected and saved with enterprise-grade reliability features like atomic writes and debouncing. Perfect for config files, application state, caches, or simple embedded databases.

## ✨ Key Features

- 🚀 **Zero Configuration** - Just modify objects, saves happen automatically
- 🛡️ **Crash-Safe Atomic Writes** - No corrupted files, even during power failures
- ⚡ **Smart Debouncing** - Efficient disk I/O with configurable delays
- 💾 **Multiple API Styles** - Callbacks, Promises, or async/await
- 🎯 **TypeScript Ready** - Full type definitions included
- 📦 **Tiny Footprint** - Zero dependencies, pure Node.js
- ✅ **Well Tested** - 92% test coverage with 41 comprehensive tests

## Requirements

- **Node.js 6.0.0 or higher** (Node.js 14+ recommended for async/await support)
- Native support for [ES6 Proxy and Reflect](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)

### Why Proxy Support Matters

Proxy support is key to filejson's elegant API. Unlike other modules that require explicit function calls for each save operation, filejson automatically detects and saves changes:

```javascript
// Other modules require explicit save calls
otherModule.set("key", "value");
otherModule.save();

// filejson saves automatically - just modify the object
file.contents.key = "value"; // ✨ Automatically saved!
```

### Node.js Version Support

| Node.js Version   | Status             | Features Available                  |
| ----------------- | ------------------ | ----------------------------------- |
| 18+ (Current LTS) | ✅ **Recommended** | All features, best performance      |
| 14+               | ✅ Supported       | Async/await, Promises, all features |
| 12+               | ✅ Supported       | Async/await, Promises, all features |
| 6-11              | ⚠️ Legacy          | Callbacks only, limited testing     |
| < 6               | ❌ Not Supported   | Requires polyfills (see below)      |

### Legacy Node.js Support (< 6)

For Node.js versions older than 6, you'll need additional setup. See the [legacy installation guide](#additional-installation-and-usage-steps-for-those-using-nodejs-5-or-earlier) below.

## Installation

```javascript
npm install filejson --save
```

[If you are using Node.js 5 or earlier, some additional installation and usage steps are needed. Click here.](#additional-installation-and-usage-steps-for-those-using-nodejs-5-or-earlier)

## Testing

This package includes a comprehensive test suite using Mocha.

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Code Quality

This package uses ESLint for code quality and consistency.

```bash
# Run ESLint
npm run lint

# Auto-fix ESLint issues
npm run lint:fix
```

## Example usage

### Callback-based (traditional)

```javascript
const Filejson = require("filejson");

try {
  const file1 = new Filejson();

  file1.load("file1.json", function (error, file) {
    if (error) {
      console.error("Load error:", error);
      return;
    }

    console.log(file.contents); // outputs {"abc": "123"}

    file.contents.msg = "Hello World"; // saves {"abc": "123", "msg": "Hello World"}

    console.log(file.contents); // outputs {"abc": "123", "msg": "Hello World"}
  });
} catch (error) {
  console.error("Initialization error:", error);
}
```

### Promise-based (modern)

```javascript
const Filejson = require("filejson");

try {
  const file1 = new Filejson();

  file1
    .load("file1.json")
    .then((file) => {
      console.log(file.contents); // outputs {"abc": "123"}

      file.contents.msg = "Hello World"; // saves {"abc": "123", "msg": "Hello World"}

      console.log(file.contents); // outputs {"abc": "123", "msg": "Hello World"}
    })
    .catch((error) => {
      console.error("Error:", error);
    });
} catch (error) {
  console.error("Initialization error:", error);
}
```

### Async/Await (recommended)

```javascript
const Filejson = require("filejson");

try {
  const file1 = new Filejson();
  const file = await file1.load("file1.json"); // file1.json contains {"abc": "123"}

  console.log(file.contents); // outputs {"abc": "123"}

  file.contents.msg = "Hello World"; // Automatically saved!

  console.log(file.contents); // outputs {"abc": "123", "msg": "Hello World"}
} catch (error) {
  console.error("Error:", error);
}
```

> **Note:** Top-level `await` requires Node.js >= 14.8. If using an older version, wrap the code in an async function.

## API Reference

### Constructor

```javascript
new Filejson([config]);
```

**Parameters:**

- `config` (Object, optional): Configuration options
  - `filename` (string): Default filename to use (can be overridden in `load()`)
  - `space` (number): Number of spaces for JSON indentation (default: 2)
  - `verbose` (boolean): Enable verbose logging (default: false)
  - `saveDelay` (number): Milliseconds to wait before saving after a change (default: 100ms)
  - `atomicWrites` (boolean): Enable atomic writes for crash safety (default: true)

**Example:**

```javascript
const file = new Filejson({ space: 4, verbose: true, saveDelay: 100 });
```

### Methods

#### load(filename, [overwriteWith], [callback])

Loads a JSON file and sets up automatic syncing.

**Parameters:**

- `filename` (string, required): Path to the JSON file
- `overwriteWith` (any, optional): Initial data to overwrite the file with
- `callback` (function, optional): Callback function `(error, instance) => {}`

**Returns:** Promise if no callback provided, undefined otherwise

**Examples:**

```javascript
// Callback style
file.load("data.json", (error, instance) => {
  /* ... */
});

// Promise style
file.load("data.json").then((instance) => {
  /* ... */
});

// Async/await style
const instance = await file.load("data.json");

// With initial data
await file.load("data.json", { initial: "data" });
```

#### save([callback])

Manually saves the current contents to disk. Note: saves happen automatically when you modify `contents`.

**Parameters:**

- `callback` (function, optional): Callback function `(error, instance) => {}`

**Returns:** Promise if no callback provided, undefined otherwise

**Examples:**

```javascript
// Callback style
file.save((error, instance) => {
  /* ... */
});

// Promise style
file.save().then((instance) => {
  /* ... */
});

// Async/await style
await file.save();
```

#### saveSync()

**Synchronously** saves the current contents to disk. Unlike `save()`, this method blocks until the write completes and does not return a Promise.

> **Primary Use Case:** Exit handlers where async operations may not complete before process termination.

**Parameters:** None

**Returns:** The Filejson instance (for method chaining)

**Throws:** Error if serialization or file write fails

**Examples:**

```javascript
// In an exit handler
process.on('SIGINT', () => {
  console.log('Saving before exit...');
  file.saveSync(); // Blocks until saved
  process.exit(0);
});

// With error handling
process.on('SIGTERM', () => {
  try {
    file.saveSync();
    console.log('Saved successfully');
  } catch (error) {
    console.error('Save failed:', error);
  }
  process.exit(0);
});

// Method chaining
file.saveSync().paused = false;
```

**Important Notes:**
- Clears any pending debounced saves
- Still respects `atomicWrites` configuration
- Blocking operation - use `save()` for normal operations
- Only use in exit handlers or when sync behavior is required

### Properties

#### contents

The JavaScript value that is automatically synced to the JSON file. Can be modified directly, and changes are automatically saved.

**Example:**

```javascript
await file.load("data.json");

// Simple modifications
file.contents.name = "John";
file.contents.age = 30;

// Nested modifications
file.contents.preferences.theme = "dark";

// Array modifications
file.contents.tags.push("new-tag");

// Deletions
delete file.contents.obsoleteField;

// All of the above trigger automatic saves!
```

#### paused

Boolean flag to temporarily pause automatic saving. Useful when making multiple changes and you want to save only once.

**Example:**

```javascript
file.paused = true;
file.contents.field1 = "value1";
file.contents.field2 = "value2";
file.contents.field3 = "value3";
file.paused = false;

await file.save(); // Save all changes at once
```

### When to Use Manual save() or saveSync()

**You typically don't need to call these methods manually** - that's the whole point of filejson! Changes are automatically saved in the background.

However, there are a few edge cases where manual saves are useful:

#### 1. Before Process Exit (use saveSync)

Ensure all changes are written before your application closes. **Always use `saveSync()`** because async operations may not complete before the process exits:

```javascript
process.on("SIGINT", () => {
  file.saveSync(); // Synchronous - blocks until saved
  process.exit(0);
});

process.on("SIGTERM", () => {
  try {
    file.saveSync();
  } catch (error) {
    console.error("Failed to save on exit:", error);
  }
  process.exit(1);
});
```

#### 2. After Using `paused` Mode (use save)

Explicitly save after making batched changes:

```javascript
file.paused = true;
// ... make many changes ...
file.paused = false;
await file.save();
```

#### 3. Bypassing Debounce for Urgent Writes (use save)

Force immediate write despite `saveDelay` setting:

```javascript
const file = new Filejson({ saveDelay: 500 });
file.contents.critical = "urgent data";
await file.save(); // Writes immediately, bypassing 500ms delay
```

#### 4. Before External Programs Read the File (use saveSync)

Ensure data is written synchronously before another process accesses it:

```javascript
file.contents.config = newSettings;
file.saveSync(); // Blocks until written to disk
exec("other-program --config data.json"); // Now safe to use
```

> **Remember:** For normal usage, just modify `file.contents` and let filejson handle the saving automatically!

## Debouncing / Save Delay

By default, filejson uses a 100ms debounce delay to optimize disk I/O. You can adjust this value based on your needs, or set it to 0 for immediate saves (no debouncing).

### Why Use Debouncing?

- **Reduce Disk I/O**: When making many rapid changes, debouncing ensures only one write occurs after changes stop
- **Improve Performance**: Fewer disk writes mean better performance, especially on slower storage
- **Batch Updates**: Automatically combines multiple rapid changes into a single save operation

### Usage

```javascript
// Configure a 100ms debounce delay
const file = new Filejson({ saveDelay: 100 });
await file.load("data.json");

// Make rapid changes - only saves once after 100ms of inactivity
for (let i = 0; i < 1000; i++) {
  file.contents.counter = i;
}
// Only one file write occurs 100ms after the loop completes
```

### Examples

**Immediate saves (no debouncing):**

```javascript
const file = new Filejson({ saveDelay: 0 });
await file.load("data.json");
file.contents.value = 1; // Saves immediately
file.contents.value = 2; // Saves immediately
// Result: 2 disk writes
```

**Debounced saves:**

```javascript
const file = new Filejson({ saveDelay: 100 });
await file.load("data.json");
file.contents.value = 1; // Scheduled to save in 100ms
file.contents.value = 2; // Cancels previous, schedules new save in 100ms
// Result: 1 disk write (after 100ms of inactivity)
```

**Manual save bypasses debounce:**

```javascript
const file = new Filejson({ saveDelay: 500 });
await file.load("data.json");
file.contents.value = 1;
await file.save(); // Saves immediately, bypassing the 500ms delay
```

### Recommended Delays

- `0ms` (default): Immediate saves, no debouncing - best for infrequent updates
- `50-100ms`: Good balance for most applications with moderate update frequency
- `200-500ms`: Suitable for high-frequency updates (e.g., real-time data)
- `1000ms+`: For very high-frequency updates where data loss tolerance is acceptable

## Atomic Writes (Crash Safety)

By default, filejson uses **atomic writes** to ensure your data files are never corrupted, even if your application crashes or loses power during a save operation.

### How Atomic Writes Work

1. **Write to a temporary file** (e.g., `data.json.tmp12345`)
2. **Atomically rename** the temp file to the target filename (e.g., `data.json`)
3. The rename operation is atomic on most file systems - other processes see either the old complete file or the new complete file, never a partially written file

### Benefits

- **No Data Corruption**: Prevents partial writes if your process crashes mid-save
- **Crash Safety**: If power fails during write, your original file remains intact
- **Consistency**: Other processes never see incomplete or malformed JSON
- **Production Ready**: Safe for use in production environments with critical data

### Usage

Atomic writes are **enabled by default** and require no configuration:

```javascript
const file = new Filejson();
await file.load("data.json");
file.contents.critical = "data";
// Saves atomically - guaranteed no corruption even if process crashes
```

### Disabling Atomic Writes

In some edge cases (e.g., network file systems with slow renames), you may want to disable atomic writes:

```javascript
const file = new Filejson({ atomicWrites: false });
await file.load("data.json");
file.contents.value = "data";
// Writes directly to the file (faster but not crash-safe)
```

### When to Disable

- **Network file systems** where rename operations are slow or problematic
- **Non-critical data** where corruption risk is acceptable for performance
- **Testing environments** where you want to observe partial write behavior

**Note:** For most use cases, keep atomic writes enabled (the default) for maximum safety.

## Additional installation and usage steps for those using Node.js 5 or earlier

- You will need a polyfill such as [harmony-reflect](https://github.com/tvcutsem/harmony-reflect):

```
npm install harmony-reflect --save
```

- In addition to requiring filejson, you will need to require harmony-reflect at the top of your app, like this:

```javascript
var Reflect = require("harmony-reflect");
```

- Lastly, every time you run your app you will need to use the node --harmony_proxies flag, like this:

```
node --harmony_proxies index.js
```
