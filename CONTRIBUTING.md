# Contributing Guide

Thank you for contributing to AI Resume Analyzer.

## Branching Strategy (Git Flow)

- `main`: production-ready code only.
- `develop`: integration branch for upcoming release.
- `feature/*`: new features off `develop`.
- `hotfix/*`: urgent fixes off `main`.

## Feature Workflow

1. Sync local repo and checkout `develop`.
2. Create branch: `git checkout -b feature/<short-name>`.
3. Commit frequently with clear messages.
4. Push branch and open PR to `develop`.
5. Ensure CI passes and address review comments.
6. Merge via PR after approval.

## Hotfix Workflow

1. Create `hotfix/<short-name>` from `main`.
2. Implement and validate fix.
3. Open PR to `main`.
4. After merge, back-merge `main` into `develop`.

## Commit Quality Gate

Pre-commit hook runs `lint-staged` through Husky.

If hooks are not installed yet:

```bash
npm install
npm run prepare
```

## Pull Request Rules

- Keep PRs focused and small.
- Link related issue.
- Include test evidence (`lint`, `typecheck`, `build`).
- Request at least one review.

## Release and Versioning

This project follows Semantic Versioning:

- Major: breaking changes
- Minor: backward-compatible features
- Patch: backward-compatible fixes

Release steps:

1. Update `VERSION` and `package.json` version.
2. Update `CHANGELOG.md`.
3. Merge `develop` into `main` via PR.
4. Tag release: `git tag -a vX.Y.Z -m "Release vX.Y.Z"`.
5. Push tags: `git push origin --tags`.

## Mirroring To GitLab

1. Add secondary remote:

```bash
git remote add gitlab <gitlab-repository-url>
```

2. Verify remotes:

```bash
git remote -v
```

3. Push branch to both remotes:

```bash
git push origin HEAD
git push gitlab HEAD
```

4. Or use npm script:

```bash
npm run git:push:all
```
