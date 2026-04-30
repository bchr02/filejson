# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2026-04-30

### Added

- **`createIfMissing` option**: New configuration option that, when set to `true`, automatically creates the JSON file if it does not exist on `load()` instead of returning an error
  - Defaults to `false` to preserve existing behaviour
  - Useful for first-run scenarios where the data file may not yet exist
- **Named exports**: `module.exports.Filejson` and `module.exports.default` now exposed alongside the default export, enabling ESM-style and destructured imports (`const { Filejson } = require('filejson')`)

## [1.2.0] - 2025-10-01

### Added

- **TypeScript definitions**: New `index.d.ts` type-definition file providing full TypeScript support
  - Typed constructor options (`FileJsonOptions`), `load()`, `save()`, `saveSync()`, `set()`, `get()`, `pause()`, `resume()` and all events
  - Enables `import FileJson from 'filejson'` in TypeScript projects with correct type inference
- **`llms.txt`**: Machine-readable documentation file for AI/LLM tooling that describes the full API, configuration options, and usage patterns in a compact format
- **Improved JSDoc**: `save()` callback parameter and `handler` argument are now fully documented in the source; fixed a misleading inline comment in the auto-save handler
- **GitHub Actions CI**: New `.github/workflows/ci.yml` runs the test suite against Node.js 18, 20, and 22 on every push and pull request
  - Matrix strategy with `fail-fast: false` so all Node versions are always tested independently
  - Codecov integration uploads `lcov.info` coverage data (Node 20 only) to track coverage trends over time
  - Live CI and coverage badges added to README
- **`CONTRIBUTING.md`**: Step-by-step guide covering forking, installing, branching, running tests, linting, and opening a pull request
- **`SECURITY.md`**: Security policy with supported-versions table and instructions for responsibly disclosing vulnerabilities

### Changed

- **Default `saveDelay` changed from `0ms` to `100ms`**: Auto-saves are now debounced by 100 ms by default, which significantly reduces disk I/O for applications that mutate data in rapid succession
  - To restore the previous immediate-save behaviour, set `saveDelay: 0` in the constructor options
  - Manual calls to `save()` and `saveSync()` are never affected by `saveDelay`

### Fixed

- Increased timing margins in the Mocha test suite to prevent intermittent failures on slower or heavily loaded CI runners

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
