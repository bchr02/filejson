# Security Policy

## Supported Versions

Only the latest published version of filejson receives security fixes.

| Version | Supported          |
| ------- | ------------------ |
| latest  | ✅ Yes             |
| older   | ❌ No              |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

If you discover a security vulnerability, please report it privately by emailing the maintainer or by using [GitHub's private vulnerability reporting](https://github.com/bchr02/filejson/security/advisories/new).

Please include as much of the following as possible:

- A description of the vulnerability and its potential impact
- Steps to reproduce the issue or a proof-of-concept
- The affected version(s)
- Any suggested mitigations

You can expect an acknowledgement within **48 hours** and a resolution or status update within **7 days**.

## Scope

filejson is a file persistence library. Key security considerations include:

- **File path handling** — ensure filenames are validated by the calling application to prevent path traversal attacks.
- **Untrusted JSON input** — filejson uses `JSON.parse`, which is safe against prototype pollution in modern Node.js, but callers should validate data from untrusted sources before storing it.
- **File permissions** — filejson writes files using the process's default umask. Production deployments should ensure appropriate file system permissions.

## Disclosure Policy

Once a fix is available we will:

1. Release a patched version on npm
2. Publish a [GitHub Security Advisory](https://github.com/bchr02/filejson/security/advisories)
3. Credit the reporter (unless they prefer to remain anonymous)
