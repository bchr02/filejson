# Tests

This directory contains the test suite for filejson.

## Running Tests

```bash
# Install dependencies first
npm install

# Run all tests
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch
```

## Test Structure

- `filejson.test.js` - Main test suite covering all functionality

## Test Coverage

The test suite covers:

### Core Functionality

- Constructor with default and custom configurations
- Loading JSON files (callback and Promise API)
- Saving files (callback and Promise API)
- Error handling for invalid files

### Auto-save Features

- Automatic saving on property modification
- Automatic saving on property addition
- Automatic saving on property deletion
- Nested object modifications
- Array modifications

### Advanced Features

- Manual save with `paused` flag
- Multiple file instances
- Custom JSON formatting (spacing)
- All JSON data types (string, number, boolean, null, object, array)
- Deeply nested structures

### API Compatibility

- Traditional callback-based API
- Modern Promise-based API
- Both APIs for `load()` and `save()` methods

## Test Files

Tests create temporary JSON files in the `test-files/` directory during execution. These files are automatically cleaned up after each test.

## Adding New Tests

When adding new tests:

1. Follow the existing structure using Mocha's `describe()` and `it()` blocks
2. Use the `testDir` path for any test files
3. Ensure cleanup happens in `afterEach()` hook
4. Test both callback and Promise APIs when applicable
5. Use meaningful test descriptions
