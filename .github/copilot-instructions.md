# Copilot Agent Instructions

These instructions apply to every Copilot agent session working on this repository.

## Versioning and Changelog (mandatory for every PR)

This project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html) and maintains a `CHANGELOG.md` in [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format.

**You must evaluate and, if warranted, perform a version bump and changelog update as part of every PR that changes code or public API.**

### When to bump the version

| Change type | Version segment | Example |
|---|---|---|
| New feature or option added (backward-compatible) | **minor** | `1.2.0` → `1.3.0` |
| Bug fix or internal improvement (backward-compatible) | **patch** | `1.2.0` → `1.2.1` |
| Breaking change (removes or changes existing behaviour) | **major** | `1.2.0` → `2.0.0` |
| Docs, tests, CI only (no code change visible to consumers) | none | no bump needed |

### Steps required when a bump is needed

1. Update the `"version"` field in `package.json`.
2. Add a new `## [x.y.z] - YYYY-MM-DD` section at the top of `CHANGELOG.md` (below the header) with `### Added`, `### Changed`, `### Fixed`, or `### Removed` sub-sections as appropriate.
3. Describe every user-visible change in plain language — one bullet per change.

### Important reminders

- Do **not** leave a new version number in `package.json` without a matching `CHANGELOG.md` entry.
- Do **not** leave user-visible changes undocumented in `CHANGELOG.md`.
- If you are unsure whether a bump is needed, default to making one and explain why in the PR description.

## Code Quality (mandatory for every PR)

- Run `npm run lint` before finalising. Fix all errors; warnings are acceptable.
- Run `npm test` before finalising. All tests must pass.
- If you add a new feature or fix a bug, add or update tests in `test/filejson.test.js`.

## TypeScript Definitions

- If you add, remove, or change any public method, option, or return type in `app.js`, update `index.d.ts` to match.

## README

- If you add a user-facing feature or option, add a usage example to `README.md`.
