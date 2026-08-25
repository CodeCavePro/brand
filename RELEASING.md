# Releasing `@codecavepro/brand`

How to publish the brand package to npm, and how to get out of it if the publish
was wrong.

**Read the rollback section before the first publish, not after.** npm's
unpublish window is 72 hours and a version number, once used, can never be
reissued. Everything else in this runbook is reversible; that is not.

## When to use this runbook

- A token value changed in `docs/` and consumers need it — a minor bump.
- The package layout changed (export paths, module shape) — a **major** bump,
  now that 1.0 is out and the layout is a promise.
- The very first publish, [CCWEB2-318](https://codecave.atlassian.net/browse/CCWEB2-318)
  phase 5. Read [First publish only](#first-publish-only) as well; it has
  preconditions the routine path does not.

**Do not use it** for changes that do not reach the tarball. The package ships
`dist/` plus `README.md` and `LICENSE` — 57 files as of 2.1.2. Storybook
specimens, docs pages, `DESIGN.md` and `WEBSITE-REVIEW.md` are none of them.
Those deploy with GitHub Pages on push and need no release.

**A capture *is* a change that reaches the tarball, now that components ship.**
Refreshing `docs/source_examples/` moves published bytes, so it is a release,
and `npm run check:captures` is a precondition of every publish rather than only
the first — with the checkout on `development`, because it reads whatever branch
it finds. See [CONTRIBUTING.md](/CONTRIBUTING.md).

## Who publishes

**GitHub Actions does, and pushing a version tag is what asks it to.**
[`.github/workflows/release.yml`](/.github/workflows/release.yml) runs the whole
verification below and then publishes; nothing in the routine release happens on
your machine except deciding the version and pushing the tag.

It authenticates as a **trusted publisher** — OIDC. There is no npm token in
this repository, no `NPM_TOKEN` secret and no OTP to type: npm mints a
short-lived credential after matching the workflow's identity against what is
registered on the package, and attaches a provenance attestation on the way out.
See [The trusted publisher](#the-trusted-publisher) for the one-time setup, and
for what silently revokes it.

This reverses what this file used to say. The old reasoning was that a manual
publish leaves no automation-shaped path to publishing something unreviewed —
true of the credential, and false of everything else. Doing it by hand was also
the only thing standing between the registry and a skipped step, and step 3's
tarball rehearsal was five shell one-liners that were easy to skip and had
already drifted from the build once (CCWEB2-370). Trusted publishing removes the
stored credential that was the objection, and CI runs the rehearsal every time
instead of when someone remembers. **The review did not go away — it is the
tag.** Nothing publishes that a person did not name.

## Prerequisites

| | Needed | Check it |
|---|---|---|
| Node | ≥ 22 (`engines`); both workflows run 24 | `node --version` |
| Working tree | clean, on `development`, pushed | `git status` |
| Trusted publisher | registered on the package, workflow `release.yml` | [the package's access settings](https://www.npmjs.com/package/@codecavepro/brand/access) |
| Push access | enough to create and push a tag | `git push --dry-run` |

**`npm whoami`, an npm login and org membership are no longer prerequisites**
for a routine release. They matter for the by-hand fallback under
[If CI cannot publish](#if-ci-cannot-publish), and for the rollback commands,
which stay manual because npm offers no automated path for them.

**The org exists and `salaros` owns it.** `npm org ls codecavepro` returns
`{"salaros": "owner"}`, checked 2026-08-21 — and checked to be a real answer
rather than a swallowed error, by running the same command against
`codecavepro-definitely-not-real` and watching it return `E404 Scope not found`.
A command that reports success by printing nothing is worth provoking once.

## The routine release

Every step is a command whose failure stops you. Nothing here is a judgement
call except step 1.

### 1. Decide the version

The package is 1.0 and under ordinary semver. The layout is a promise now: an
export cannot move or disappear outside a major bump.

| Change | Bump |
|---|---|
| README wording, a fixed build, a docs-only change | patch — `1.0.0` → `1.0.1` |
| a token **value** changing, a token added, an export **added** | minor — `1.0.0` → `1.1.0` |
| an export path moving, a module shape changing, a token **removed** | major — `1.0.0` → `2.0.0` |

A token value moving is a **minor**, not a patch. It is not a bug fix — the
palette tracks a living design system, and a consumer who pinned `~1.0.0`
deserves to opt into a colour change rather than receive it. Removing a token is
a major for the same reason it is in any library: somebody's `var()` goes
undefined and nothing tells them.

```bash
npm version --workspace @codecavepro/brand minor --no-git-tag-version
```

(`minor` is the common case — a token value moved. Substitute `patch` or
`major` per the table.)

`--no-git-tag-version` is deliberate: npm tags as `v1.0.1`, and this repo tags
as `1.0.1`. Letting npm do it also commits on your behalf. Tag by hand in
step 4 — and note that the tag is now the thing that publishes, so it is not a
step to run early.

Use the command rather than editing `package.json`, because it also writes the
new version into `package-lock.json`. Editing by hand leaves the two
disagreeing, and `npm ci` — which is what CI runs — refuses to install a
workspace in that state. If you did edit by hand, `npm install
--package-lock-only` fixes it.

### 2. Build from a clean tree and verify the derivation

**CI runs this too, before it publishes** — every step from here to the end of
step 3 is in `release.yml`. Running it locally first is not ceremony: once the
tag is pushed there is no rehearsal left, so this is where a mistake is still
free.

```bash
npm run build && npm run check
```

`check` asserts what the package promises: three files byte-identical to their
origin (`docs/colors_and_type.css`, `docs/fonts/fonts.css`, the root `LICENSE`),
`dist/tokens.css` still re-extracting from `docs/colors_and_type.css` and
`dist/theme.css` from `docs/theme.css` to exactly what shipped, every component
matching the capture it was copied from, the ports typechecking, and the
storybook matching `docs/source_examples/`. If the
byte-identity assertion fails, **do not fix it in `packages/`** — the fix
belongs in `docs/`, which is the origin. See [CLAUDE.md](/CLAUDE.md).

`npm run check` needs `dist/` to exist, which is why `release.yml` runs
`npm run build` immediately before it — a fresh checkout has no `dist/` at all,
and a `check` run against one would be asserting things about nothing.

### 3. Validate the tarball — the actual artifact

```bash
npm pack --workspace @codecavepro/brand
```

This runs `prepack`, so the full build (including the README value assertions)
runs again and cannot be skipped. It writes
`codecavepro-brand-<version>.tgz` — **the exact bytes npm would publish.**
Install it somewhere real, then ask it the questions a consumer asks first:

```bash
mkdir -p /tmp/brand-smoke && (cd /tmp/brand-smoke && npm init -y && npm i "$OLDPWD"/codecavepro-brand-*.tgz --legacy-peer-deps)
```

```bash
node docs/tools/smoke-tarball.mjs /tmp/brand-smoke/node_modules/@codecavepro/brand
```

That prints seventeen assertions and exits 0, or names what is broken and exits
1. `--legacy-peer-deps` skips auto-installing the five peers; nothing the script
checks imports them, and `vue` is a large download to prove nothing with.

**Why the tarball and not the tree.** `files: ["dist"]` decides what ships,
`exports` decides what resolves, and npm picks `LICENSE` and `README.md` up from
the package root **by name** — `files` neither includes nor excludes them. None
of those three are visible to a check that walks `dist/` in place, so a package
can be completely correct on disk and broken for everyone who installs it. The
licence is a build-time copy of the repo root's; if it is missing, the build did
not run — stop.

**This was five shell one-liners until the release moved to CI**, one of them
900 characters of inlined JavaScript. It is a script because `release.yml` runs
the same command, and because that last one-liner had already drifted: it read
only `from "..."`, reported that everything resolved over a 1.6.0 tarball whose
`Checkbox.vue` reached a `checked-icon.svg` that was not in it, and the bug
shipped (CCWEB2-370). A background-image is a reference like any other.

The reference walk is the assertion worth understanding. The captures flatten
the site's `src/components/` level away while their imports still climb through
it — `common/Checkbox.vue` reaches `../../assets/icons/asterisk-icon.vue` — so
the package ships at the site's depth to keep those resolving. The storybook
cannot catch a regression there, because `build-storybook.mjs` re-roots escaping
imports with a resolver plugin and a consumer's `import` has no such plugin. A
dangling reference means the package is broken for every consumer while looking
fine in this repo.

`smoke-tarball.mjs` mirrors `referencesOf()` in `build.mjs`, deliberately and by
copy. **Keep the two in step** — if the build learns a new spelling of "reaches",
this has to learn it too, because this one runs against the tarball rather than
against the tree that produced it. Each of its eleven failure modes was proven
to fire by breaking an installed copy one way at a time.

> **This replaces the git-dependency validation named in CCWEB2-318 phase 5.**
> That plan proposed proving the loop with a `github:CodeCavePro/brand#tag`
> dependency first, on the grounds that it is free and reversible. It does not
> work here: an npm git dependency installs the **repository root**, and the
> root manifest — `/package.json`, not `packages/brand/package.json` — is
> `private: true` and publishes nothing. A consumer would install the
> workspace, not the package.
>
> The tarball is strictly better anyway — it is free, reversible *and* it is
> literally what npm publishes, which the git dependency never was.

Delete the smoke directory and the `.tgz` when done. The release itself packs
its own tarball on the runner and never sees yours, but `npm publish <file.tgz>`
is a real command and a stale one in the repo root is a thing someone will
eventually reach for.

### 4. Commit, tag and push — the tag is the publish

```bash
git commit -am "Release @codecavepro/brand 1.0.1" && git push
```

```bash
git tag -a 1.0.1 -m "Release 1.0.1 — <what changed>" && git push origin 1.0.1
```

**Pushing that tag publishes.** Everything above this line is reversible;
pushing the tag starts a run that ends at the registry, and a version number,
once used, can never be reissued. Push the commit first and the tag separately,
so the two are distinguishable acts rather than one keystroke.

**Tags are the bare version — `1.0.1`.** No `v`, no package prefix. Set by
`1.0.0` on 2026-08-21, the repo's first tag, and now load-bearing: `release.yml`
triggers on `[0-9]+.[0-9]+.[0-9]+` and refuses to run from a branch.

Tags are annotated (`git tag -a`), not lightweight, so each carries its tagger,
date and a message saying what was in it.

**The tag must equal `packages/brand/package.json`'s version.** The workflow
asserts it and stops if they disagree, because that is the one mistake here that
would otherwise succeed quietly: tagging `1.0.2` while the manifest still says
`1.0.1` republishes `1.0.1` under a tag claiming otherwise, and npm never sees
the tag, so nothing downstream would ever notice. If you get it wrong, delete
the tag (`git tag -d` and `git push origin :1.0.2`), fix one of the two, and tag
again.

### 5. Watch the run

[Actions → Publish `@codecavepro/brand` to npm](https://github.com/CodeCavePro/brand/actions/workflows/release.yml).

It runs the toolchain floor, the tag/manifest guard, an already-published guard,
`npm ci`, the build, `npm run check`, the captures check when it can reach
codecave.pro, and the tarball smoke test — and only then publishes. A red run
before the publish step has cost nothing.

Two things in the summary are worth reading rather than skimming:

- **"Captures were not verified"**, if it appears. `docs/source_examples/` is
  evidence, nineteen components are built from it, and CI cannot reach the site
  today. This is the one precondition the pipeline cannot enforce for you.
- **Provenance.** A trusted-publisher release attaches an attestation; the npm
  page shows the commit and the workflow run that built it. If the badge is
  absent, the publish did not go out as a trusted publisher and something in
  [The trusted publisher](#the-trusted-publisher) has drifted.

### 6. Close the loop

Comment the version and tag on the CCWEB2-318 phase-5 issue. If this publish
changed a token value, say which — the site consumes these, and a value change
is the only kind of release with downstream work attached.

codecave.pro will not move on its own: it installs with `pnpm install
--frozen-lockfile`, so it runs whatever its lockfile pins until someone raises
the range and regenerates it.

## The trusted publisher

One-time setup, on the **package** rather than the org:
[npmjs.com/package/@codecavepro/brand/access](https://www.npmjs.com/package/@codecavepro/brand/access)
→ Trusted publisher → GitHub Actions.

| Field | Value |
|---|---|
| Organization or user | `CodeCavePro` |
| Repository | `brand` |
| Workflow filename | `release.yml` — **the bare filename**, not the path |
| Environment name | *empty* — the job declares no environment |
| Allowed actions | `npm publish` |

**Every field is case-sensitive and matched exactly.** The workflow filename is
the one people get wrong: `.github/workflows/release.yml` will never match.

**The filename is part of the credential.** Renaming
`.github/workflows/release.yml` revokes the ability to publish, and npm reports
that as

```
npm error code E404
npm error 404 Not Found - PUT https://registry.npmjs.org/@codecavepro%2fbrand
```

which reads as "no such package" and is not that — the package exists. Every
OIDC failure arrives wearing that costume, so work down the table above before
suspecting anything else.

One thing is genuinely unproven and is written down in the workflow too: whether
npm's OIDC exchange resolves the package correctly for `npm publish
--workspace`, given that this package sits in a subdirectory and declares
`repository.directory`. Trusted publishing has known rough edges with nested
packages. If every field above is right and the PUT is still refused, the next
thing to try is publishing from the package directory — `working-directory:
packages/brand` with a bare `npm publish`, which reaches the same manifest by a
plainer route.

## If CI cannot publish

The fallback is the old manual path, and it needs an npm login and org
membership:

```bash
npm run release -- --otp=123456
```

**The `--workspace` flag inside that script is not optional, and it is the
entire reason this is a script rather than a command you type.** Bare `npm
publish` at the repository root targets the **root manifest** —
`/package.json` — and not `packages/brand/package.json`, which is the one that
describes this package. The two share the name `@codecavepro/brand`, so the
distinction is by path and only by path. The root manifest's `private: true`
stops it, with

```
npm error This package has been marked as private
```

which reads like a problem with the package you meant to publish and is not one.
**Do not remove that `private` field to make the message go away.** It is the
only thing between a mistyped command and 554 files of monorepo on the public
registry, and the package it is refusing to publish is the wrong package
anyway.

No rehearsal catches this. Verified on npm 11.7.0: `npm publish --dry-run` on a
`private` package prints `+ name@version` and exits 0. Only the real publish
enforces it — which is a reason to prefer the pipeline, where the command is
written down rather than typed.

`publishConfig.access` is already `public` in the manifest, so the script's
`--access public` is redundant — it is there so the intent shows up in shell
history. A scoped package defaults to restricted, and a restricted publish under
a free org fails rather than silently going private, but do not rely on that as
the safety net.

A hand publish gets **no provenance attestation**. That is not a reason to avoid
it in an emergency; it is a reason to say so in the CCWEB2-318 comment, because
the npm page will differ from every other release.

Then tag as in step 4 — the workflow will refuse the already-published version,
which is correct, and the tag still needs to exist.

## Rollback

**Order matters. Read all four before doing any.**

### Within 72 hours, nothing depends on it, and the publish was a mistake

```bash
npm unpublish @codecavepro/brand@1.0.1
```

npm allows this only inside the 72-hour window and only while no other package
depends on the version. **The version number is burned regardless** — it can
never be republished, even with different content. Bump and republish; never try
to reuse the number.

### After 72 hours, or if anything depends on it

Unpublishing is not available. Deprecate, then ship a fix:

```bash
npm deprecate @codecavepro/brand@1.0.1 "Broken build — use 1.0.2 or later."
```

The version stays installable — deprecation is a warning on install, not a
removal — so the fix has to be a real one. Publish `1.0.2` immediately.

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
first one has three preconditions the rest do not, in this order:

1. **`docs/source_examples/` has been re-measured.** Run
   `npm run check:captures`. A clean result is **not durable** — the captures
   measured nine drifted files on 2026-08-19 and thirteen the next day. Nothing
   in the token package is built from a capture today, but check before
   assuming that is still true.
2. **Every name is settled.** **A token name is only cheap to change while
   nobody has installed it** — before the first publish a rename is free, after
   it a rename is a `2.0.0`. Two were caught this way and both were free:
   `spacing.controlHeight` shipping 44px against production's 48px, and
   `--text-lg`/`--text-sm`/`--text-base` silently redefining Tailwind defaults
   in every consumer's app. `npm run check:collisions` guards the second class.
   Expect a third. **The last chance to rename anything is the run of this
   checklist that ends in `npm publish`.**

   Note what the first one implies: documenting a divergence honestly is right
   for a token already published, and the wrong thing to do for one you are
   about to publish for the first time and could simply get right.
3. **Version `1.0.0`.** The manifest already says so, and `1.0.0` is tagged. Publishing straight at 1.0 is a deliberate call, not an oversight:
   the token values are the thing consumers depend on and they already mirror
   production, so a `0.x` would be understating the stability of the only part
   that matters to them. The cost is that the layout is now a promise — an
   export path cannot move again without a `2.0.0`. Settle any layout doubts
   **before** this publish, because after it they are expensive.

Then run the routine release from step 2 — step 1 is skipped, the version is
already correct.

## What this package cannot ship

Worth knowing before someone files a release request for one of these:

- **Font binaries.** A licensing question, not an oversight. The stylesheets
  declare six Satoshi faces and ship no files; consumers supply them. See the
  [package README](packages/brand/README.md).
- **The four CMS-shaped components.** `ArticlePreview`, `Review`,
  `pain-points-item` and `technologies` reach the site's Strapi host and token
  through `helpers/image-url.ts`. `build.mjs` excludes them by name in
  `NOT_SHIPPED`, each with its reason; they ship when
  [CCWEB2-332](https://codecave.atlassian.net/browse/CCWEB2-332) inverts that
  dependency site-side. The rest of the components ship as of 1.2.0 — but
  **nothing is published from `docs/source_examples/` until the captures have
  been re-measured against the live site, ever.**
- **Anything authored in `packages/`.** `README.md` is the single exception,
  because npm renders it as the package page and there is nowhere else for that
  page to come from — and even its example values are asserted against the
  compiled module at build time. Everything else is copied or compiled from
  `docs/`.
