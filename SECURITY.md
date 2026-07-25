# Security Policy

## Supported Versions

The latest release on the main branch receives security updates.

## Reporting a Vulnerability

This is a personal project. For critical vulnerabilities, please open a GitHub issue with the label `security` or contact the maintainer directly.

## Known Status

All tools run 100% client-side. No user data is ever transmitted to a server. Security headers are configured across all deployment platforms (Vercel, Netlify, Cloudflare Pages). Dependencies are audited regularly via CI.

## Dependency Vulnerability Management

- Runtime dependencies are kept to a minimum to reduce attack surface.
- Build-time/development-only vulnerabilities are evaluated for reachability before action. Most transitive dev dependency vulnerabilities are not exploitable in this project because they are only used during build or test.
- Automated security auditing runs via CI (pnpm audit).
- When a patched version of a parent dependency becomes available, deep transitive vulnerabilities should be re-evaluated.
