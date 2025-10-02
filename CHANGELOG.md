# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-10-01

### Added

- **Promise/async-await support**: Both `load()` and `save()` methods now return Promises when called without a callback, enabling modern async/await syntax
- Full backward compatibility: All existing callback-based code continues to work without any changes
- New `examples-async.js` file demonstrating various async/await usage patterns
- Updated README with examples for callback, Promise, and async/await approaches
- **Comprehensive test suite**: Added Mocha test framework with extensive test coverage
  - Tests for callback and Promise APIs
  - Tests for auto-save functionality
  - Tests for nested objects and arrays
  - Tests for error handling
  - Tests for multiple file instances
  - Tests for data type validation
  - Tests for paused mode
  - Over 30 test cases covering all core functionality
- New test scripts: `npm test` and `npm run test:watch`
- Test documentation in `test/README.md`
- **Modern ESLint configuration**: Updated from ESLint 3.x to 8.x
  - Added comprehensive linting rules for code quality
  - Added `npm run lint` and `npm run lint:fix` scripts
  - Added `.eslintignore` file
  - Auto-fixed 300+ formatting issues
  - Modern rules including `no-var` warnings, spacing, and formatting
- **Debounce/Save Delay feature**: New `saveDelay` configuration option
  - Reduces disk I/O for applications with rapid, frequent changes
  - Configurable delay in milliseconds (default: 100ms for optimal performance)
  - Automatically debounces multiple rapid changes into a single save
  - Manual `save()` bypasses debounce for urgent saves
  - 6 new tests covering debounce functionality
  - Comprehensive documentation with examples
  - New `examples-debounce.js` demonstration file
  - Performance improvements for high-frequency update scenarios
- **Atomic Writes feature**: New `atomicWrites` configuration option (enabled by default)
  - Prevents data corruption if process crashes during save
  - Uses write-to-temp-then-rename pattern for atomic file updates
  - Ensures other processes never see partially written files
  - Configurable with `atomicWrites: false` for edge cases (network file systems)
  - 3 new tests covering atomic write functionality
  - Comprehensive documentation with safety guarantees
  - Production-ready crash safety for critical data
- **Synchronous save method**: New `saveSync()` method for exit handlers
  - Synchronous, blocking save operation for process exit scenarios
  - Respects atomicWrites configuration
  - Clears pending debounced saves
  - Essential for ensuring data is saved before process termination
  - 6 new tests covering synchronous save functionality
  - Comprehensive documentation with exit handler patterns
  - Solves the async-operation-on-exit problem

### Changed

- Updated JSDoc comments to reflect optional callbacks and Promise return types
- Updated `.gitignore` to exclude test-generated files
- Updated `package.json` with Mocha devDependency and test scripts
- Code formatting improved throughout the codebase for consistency
- All source files now follow consistent indentation and style guidelines
- Save mechanism now uses `setTimeout` instead of `setImmediate` for configurable delays

## [1.0.15] - Previous Release

(Previous changes not documented)
