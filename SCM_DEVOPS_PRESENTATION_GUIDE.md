# SCM + DevOps Presentation Guide (Step-by-Step)

Use this guide to present the project maturity upgrades clearly.

## 1. Start With Objective

Explain that the project moved from basic source control to enterprise SCM discipline:

- Prevent bad commits early
- Enforce PR-based collaboration
- Add quality and release governance
- Support multi-remote repository strategy

## 2. Show Local Quality Gate (Husky + lint-staged)

Demo commands:

```bash
npm install
npm run prepare
```

Then explain:

- Hook file: `.husky/pre-commit`
- On commit, staged files are linted and formatted
- Commit fails if lint errors exist

## 3. Show Git Workflow Model

Open `CONTRIBUTING.md` and explain branch responsibilities:

- `main`: production
- `develop`: integration
- `feature/*`: feature development
- `hotfix/*`: urgent production fixes

## 4. Show PR Governance On GitHub

Open:

- `.github/pull_request_template.md`
- `.github/ISSUE_TEMPLATE/bug_report.md`
- `.github/ISSUE_TEMPLATE/feature_request.md`

Explain:

- Standardized issue reporting
- PR checklist with validation evidence
- Better review quality and traceability

## 5. Show CI Automation

Open `.github/workflows/ci.yml` and explain pipeline order:

1. Install dependencies
2. Lint
3. Type-check
4. Build

Point out that PRs are blocked until quality checks pass.

## 6. Show SonarQube Integration

Open `sonar-project.properties` and explain:

- Project key and name
- Source paths
- Exclusions

Demo command:

```bash
npm run sonar
```

## 7. Show Versioning + Release Discipline

Open:

- `VERSION`
- `CHANGELOG.md`

Explain Semantic Versioning:

- Major (`X.0.0`): breaking
- Minor (`1.X.0`): feature
- Patch (`1.0.X`): fix

Demo tagging flow:

```bash
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin --tags
```

## 8. Show GitLab Mirroring

Explain backup/cross-platform collaboration strategy.

Demo:

```bash
git remote add gitlab <gitlab-url>
git remote -v
npm run git:push:all
```

## 9. Present End-to-End SCM Architecture

Use this flow in explanation:

Developer -> Husky pre-commit -> GitHub PR -> CI checks -> SonarQube -> Merge/Tag -> Mirror to GitLab -> Deploy

## 10. Close With Outcomes

Summarize value delivered:

- Better code quality at commit time
- Consistent branching and PR process
- Automated CI validation
- Structured release and traceability
- Enterprise-ready SCM posture for internship review
