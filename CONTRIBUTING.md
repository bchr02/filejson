# Contributing to filejson

Thank you for your interest in contributing! Pull requests, bug reports, and suggestions are all welcome.

## Getting Started

1. **Fork** the repository and clone your fork:

   ```bash
   git clone https://github.com/<your-username>/filejson.git
   cd filejson
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Create a branch** for your change:

   ```bash
   git checkout -b my-feature-or-fix
   ```

## Running the Test Suite

```bash
# Run all tests
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

All tests must pass before a pull request will be merged. If you add new functionality, please add corresponding tests.

## Code Style

This project uses [ESLint](https://eslint.org/) to enforce consistent code style.

```bash
# Check for lint errors
npm run lint

# Auto-fix fixable issues
npm run lint:fix
```

Please ensure `npm run lint` reports no errors before submitting a PR.

## Submitting a Pull Request

1. Make sure `npm test` and `npm run lint` both pass locally.
2. Write a clear, descriptive commit message.
3. Push your branch to your fork and open a pull request against the `master` branch.
4. Describe what the PR does and reference any related issues (e.g., `Closes #42`).

## Reporting Bugs

Open an issue at <https://github.com/bchr02/filejson/issues> with:

- A minimal, reproducible example
- The Node.js version you are using (`node --version`)
- The `filejson` version (`npm list filejson`)
- Expected vs. actual behavior

## Questions & Ideas

Feel free to open an issue for feature requests or general questions. All constructive feedback is appreciated!
