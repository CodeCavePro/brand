# Releasing `@codecavepro/brand`

How to publish the brand package to npm, and how to get out of it if the publish
was wrong.

**Read the rollback section before the first publish, not after.** npm's
unpublish window is 72 hours and a version number, once used, can never be
reissued. Everything else in this runbook is reversible; that is not.

## When to use this runbook

- A token value changed in `docs/` and consumers need it.
- The package layout changed (export paths, module shape) — that is a minor
  bump while the package is pre-1.0.
- The very first publish, [CCWEB2-318](https://codecave.atlassian.net/browse/CCWEB2-318)
  phase 5. Read [First publish only](#first-publish-only) as well; it has
  preconditions the routine path does not.

**Do not use it** for changes that do not reach the tarball. The package ships
`dist/` plus `README.md` and `LICENSE` — 17 files. Storybook specimens, docs
pages, `DESIGN.md` and `WEBSITE-REVIEW.md` are none of them. Those deploy with
GitHub Pages on push and need no release.

## Prerequisites

| | Needed | Check it |
|---|---|---|
| Node | ≥ 20 (`engines`); CI builds on 22 | `node --version` |
| Working tree | clean, on `development`, pushed | `git status` |
| npm login | a member of the `codecavepro` npm org | `npm whoami` |
| Registry | `https://registry.npmjs.org/` | `npm config get registry` |

**The npm org may not exist yet.** As of 2026-08-21 the registry returns 404 for
`@codecavepro/brand` and `npm search @codecavepro` finds nothing — but neither
proves the *scope* is unregistered, only that nothing public sits under it.
Whether the org exists, and who is in it, cannot be checked without logging in.
Establish that first; a scope someone else owns is a problem to discover before
`npm publish`, not during it.

Publishing is a manual, local step by design. No CI workflow holds an npm token,
so there is no automation-shaped path to publishing something unreviewed.

## The routine release

Every step is a command whose failure stops you. Nothing here is a judgement
call except step 1.

### 1. Decide the version

The package is pre-1.0. Token *values* are stable and mirror what codecave.pro
ships; the package *layout* is not.

| Change | Bump |
|---|---|
| a token value, an added token, README wording | patch — `0.1.0` → `0.1.1` |
| an export path, a module shape, a removed token | minor — `0.1.0` → `0.2.0` |
| anything, once 1.0 is out | ordinary semver, and removals become major |

```bash
npm version --workspace @codecavepro/brand patch --no-git-tag-version
```

`--no-git-tag-version` is deliberate: npm's own tag would be `v0.1.1`, which
says nothing about *which* package in a workspace it belongs to. Tag by hand in
step 5.

### 2. Build from a clean tree and verify the derivation

```bash
npm run build && npm run check
```

`check` asserts what the package promises: three files byte-identical to their
origin (`docs/colors_and_type.css`, `docs/fonts/fonts.css`, the root `LICENSE`),
the ports typecheck, and the storybook matching `docs/source_examples/`. If the
byte-identity assertion fails, **do not fix it in `packages/`** — the fix
belongs in `docs/`, which is the origin. See [CLAUDE.md](/CLAUDE.md).

`npm run check` needs `dist/` to exist, so it is a local and `prepack` guard,
not a CI one — CI checks out a tree with no `dist/` at all. That is why step 3
matters more here than it would in a repo where CI could do it for you.

### 3. Validate the tarball — the actual artifact

```bash
npm pack --workspace @codecavepro/brand
```

This runs `prepack`, so the full build (including the README value assertions)
runs again and cannot be skipped. It writes
`codecavepro-brand-<version>.tgz` — **the exact bytes npm would publish.**
Install it somewhere real and use it:

```bash
mkdir -p /tmp/brand-smoke && cd /tmp/brand-smoke && npm init -y && npm i "$OLDPWD/codecavepro-brand-0.1.1.tgz"
```

Then check the three things a consumer does first. Run these from the smoke
directory:

```bash
node -e "import('@codecavepro/brand').then(m => console.log(m.color.action))"
```

prints a hex value — the typed module resolves, and has content rather than an
empty barrel.

```bash
node -e "const fs=require('fs'),p='node_modules/@codecavepro/brand/dist/colors_and_type.css';console.log(fs.readFileSync(p).equals(fs.readFileSync(process.argv[1]))?'identical':'DIFFERS')" /path/to/brand/docs/colors_and_type.css
```

prints `identical` — the buildless URL and the installed file are the same
bytes, which is the package's central promise.

```bash
ls node_modules/@codecavepro/brand/
```

lists `LICENSE README.md dist package.json`. The first two are there because
npm picks them up by name from the package root; `files: ["dist"]` does not
mention either, and the licence is a build-time copy of the repo's root
`LICENSE`. If `LICENSE` is missing, the build did not run — stop.

> **This replaces the git-dependency validation named in CCWEB2-318 phase 5.**
> That plan proposed proving the loop with a `github:CodeCavePro/brand#tag`
> dependency first, on the grounds that it is free and reversible. It does not
> work here: an npm git dependency installs the **repository root**, and this
> repo's root is `@codecavepro/brand-workspace`, which is `private: true` and
> publishes nothing. A consumer would install the workspace, not the package.
>
> The tarball is strictly better anyway — it is free, reversible *and* it is
> literally what npm publishes, which the git dependency never was.

Delete the smoke directory and the `.tgz` when done. Neither is tracked, but a
stale tarball in the repo root is a thing someone will eventually publish by
accident.

### 4. Publish

```bash
npm publish --workspace @codecavepro/brand
```

`publishConfig.access` is already `public` in the manifest, so `--access public`
is redundant — pass it anyway on the first publish if you want the intent in
your shell history. A scoped package defaults to restricted, and a restricted
publish under a free org fails rather than silently going private, but do not
rely on that as the safety net.

Confirm the registry agrees:

```bash
npm view @codecavepro/brand version
```

### 5. Tag and push

```bash
git commit -am "Release @codecavepro/brand v0.1.1" && git tag brand-v0.1.1 && git push && git push --tags
```

**The `brand-v<version>` convention starts here.** The repo has no tags at all
as of 2026-08-21, so this establishes the shape rather than following it. The
prefix exists because this is a workspace: a bare `v0.1.1` would have to be
guessed at once a second package lands.

### 6. Close the loop

Comment the version and tag on the CCWEB2-318 phase-5 issue. If this publish
changed a token value, say which — the site consumes these, and a value change
is the only kind of release with downstream work attached.

## Rollback

**Order matters. Read all four before doing any.**

### Within 72 hours, nothing depends on it, and the publish was a mistake

```bash
npm unpublish @codecavepro/brand@0.1.1
```

npm allows this only inside the 72-hour window and only while no other package
depends on the version. **The version number is burned regardless** — it can
never be republished, even with different content. Bump and republish; never try
to reuse the number.

### After 72 hours, or if anything depends on it

Unpublishing is not available. Deprecate, then ship a fix:

```bash
npm deprecate @codecavepro/brand@0.1.1 "Broken build — use 0.1.2 or later."
```

The version stays installable — deprecation is a warning on install, not a
removal — so the fix has to be a real one. Publish `0.1.2` immediately.

### If the wrong bytes shipped but the package works

Do nothing urgent. A byte-identity failure that nobody's browser will notice is
a patch release, not an incident. Fix in `docs/`, re-run the routine release.

### If the scope or org was wrong

Stop. Do not publish again to "correct" it. A package published to the wrong
scope is someone else's namespace and unpublishing is the only remedy —
which puts you back in the 72-hour window above, with an escalation attached.

## Escalation

| Situation | Who |
|---|---|
| npm org membership, scope ownership, billing | Yaroslav Zhmayev (repo owner) |
| A published version must be pulled and the window has closed | Yaroslav Zhmayev, then npm support |
| Token *values* are disputed — the package shipped a colour someone disagrees with | Maria Shaban; the package is not the place to settle it, `docs/` is |
| The site's consumption of the package breaks | [CCWEB2](https://codecave.atlassian.net/browse/CCWEB2), no `brand-kit` label — it is the site's to fix |

## First publish only

The routine release assumes the package already exists on the registry. The
first one has four preconditions the rest do not, in this order:

1. **The npm org exists and you are in it.** See
   [Prerequisites](#prerequisites) — unverified from this repo.
2. **[CCWEB2-319](https://codecave.atlassian.net/browse/CCWEB2-319) is settled.**
   `spacing.controlHeight` ships 44px while production renders every button at
   48px. The README documents the divergence honestly, which is the right thing
   to do for a token that is *already out* — it is the wrong thing to do for a
   token you are about to publish for the first time and could simply get right.
   Settle it, then publish the settled value.
3. **`docs/source_examples/` has been re-measured.**
   [CCWEB2-315](https://codecave.atlassian.net/browse/CCWEB2-315) closed on
   2026-08-20 and that is **not durable** — it measured nine drifted files on
   2026-08-19 and thirteen the next day. Nothing in the token package is built
   from a capture today, but check before assuming that is still true.
4. **Version `0.1.0`, not `1.0.0`.** The manifest already says so. 1.0 is a
   promise about the package layout, and the layout is the part still moving.

Then run the routine release from step 2 — step 1 is skipped, the version is
already correct.

## What this package cannot ship

Worth knowing before someone files a release request for one of these:

- **Font binaries.** A licensing question, not an oversight. The stylesheets
  declare six Satoshi faces and ship no files; consumers supply them. See the
  [package README](packages/brand/README.md).
- **Components.** [CCWEB2-318](https://codecave.atlassian.net/browse/CCWEB2-318)
  phase 4. Nothing is published from `docs/source_examples/` until a capture has
  been re-measured against the live site, ever.
- **Anything authored in `packages/`.** `README.md` is the single exception,
  because npm renders it as the package page and there is nowhere else for that
  page to come from — and even its example values are asserted against the
  compiled module at build time. Everything else is copied or compiled from
  `docs/`.
