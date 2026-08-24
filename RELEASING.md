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
`dist/` plus `README.md` and `LICENSE` — 59 files as of 1.4.0. Storybook
specimens, docs pages, `DESIGN.md` and `WEBSITE-REVIEW.md` are none of them.
Those deploy with GitHub Pages on push and need no release.

**A capture *is* a change that reaches the tarball, now that components ship.**
Refreshing `docs/source_examples/` moves published bytes, so it is a release,
and `npm run check:captures` is a precondition of every publish rather than only
the first — with the checkout on `development`, because it reads whatever branch
it finds. See [CONTRIBUTING.md](/CONTRIBUTING.md).

## Prerequisites

| | Needed | Check it |
|---|---|---|
| Node | ≥ 20 (`engines`); CI builds on 22 | `node --version` |
| Working tree | clean, on `development`, pushed | `git status` |
| npm login | a member of the `codecavepro` npm org | `npm whoami` |
| Registry | `https://registry.npmjs.org/` | `npm config get registry` |

**The org exists and `salaros` owns it.** `npm org ls codecavepro` returns
`{"salaros": "owner"}`, checked 2026-08-21 — and checked to be a real answer
rather than a swallowed error, by running the same command against
`codecavepro-definitely-not-real` and watching it return `E404 Scope not found`.
A command that reports success by printing nothing is worth provoking once.

The scope holds nothing public yet: `npm view @codecavepro/brand` is still a
404, which is what leaves `1.0.0` available to claim.

Publishing is a manual, local step by design. No CI workflow holds an npm token,
so there is no automation-shaped path to publishing something unreviewed.

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
step 5.

Use the command rather than editing `package.json`, because it also writes the
new version into `package-lock.json`. Editing by hand leaves the two
disagreeing, and `npm ci` — which is what CI runs — refuses to install a
workspace in that state. If you did edit by hand, `npm install
--package-lock-only` fixes it.

### 2. Build from a clean tree and verify the derivation

```bash
npm run build && npm run check
```

`check` asserts what the package promises: three files byte-identical to their
origin (`docs/colors_and_type.css`, `docs/fonts/fonts.css`, the root `LICENSE`),
`dist/tokens.css` still re-extracting from `docs/colors_and_type.css` to exactly
what shipped, the ports typechecking, and the storybook matching
`docs/source_examples/`. If the
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
mkdir -p /tmp/brand-smoke && cd /tmp/brand-smoke && npm init -y && npm i "$OLDPWD/codecavepro-brand-1.0.1.tgz"
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
node -e "console.log(require.resolve('@codecavepro/brand/components/common/Button.vue'))"
node -e "const fs=require('fs'),path=require('path'),root=path.dirname(require.resolve('@codecavepro/brand/package.json'))+'/dist/src';const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);const skip=/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i;const bad=[];for(const f of walk(root)){const s=fs.readFileSync(f,'utf8');const refs=[...s.matchAll(/from\s*['\"](\.[^'\"]*)['\"]/g)].map(m=>m[1]);for(const m of s.matchAll(/\burl\(\s*(?:\"([^\"]*)\"|'([^']*)'|([^)'\"\s]*))\s*\)/g)){const t=m[1]??m[2]??m[3];if(t&&!skip.test(t))refs.push(t);}for(const r of refs){const j=path.resolve(path.dirname(f),r);if(![j,j+'.ts',j+'.vue'].some(c=>fs.existsSync(c)))bad.push(path.relative(root,f)+' -> '+r);}}console.log(bad.length?'DANGLING: '+bad.join(', '):'every relative import and url() resolves')"
```

The first prints a path — the `./components/*` subpath export resolves. The
second prints `every relative import and url() resolves`, walking the installed
`dist/src/` and following every reference in it.

That one is not ceremony. The captures flatten the site's `src/components/`
level away while their imports still climb through it — `header/desktop-menu.vue`
reaches `../../assets/images/logo.svg` — so the package ships at the site's
depth to keep those resolving. The storybook cannot catch a regression here,
because `build-storybook.mjs` re-roots escaping imports with a resolver plugin
and a consumer's `import` has no such plugin. `DANGLING` means the package is
broken for every consumer while looking fine in this repo.

**It follows `url()` because for one release it did not.** This command read
only `from "..."`, printed `every relative import resolves` over a 1.6.0 tarball
whose `Checkbox.vue` reached a `checked-icon.svg` that was not in it, and the
bug shipped (CCWEB2-370). A background-image is a reference like any other; the
build now agrees, and so does this. Keep the two in step — if `referencesOf()`
in `build.mjs` learns a new spelling, this line has to learn it too, because
this one runs against the tarball rather than the tree that produced it.

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
> work here: an npm git dependency installs the **repository root**, and the
> root manifest — `/package.json`, not `packages/brand/package.json` — is
> `private: true` and publishes nothing. A consumer would install the
> workspace, not the package.
>
> The tarball is strictly better anyway — it is free, reversible *and* it is
> literally what npm publishes, which the git dependency never was.

Delete the smoke directory and the `.tgz` when done. Neither is tracked, but a
stale tarball in the repo root is a thing someone will eventually publish by
accident.

### 4. Publish

```bash
npm run release
```

If your account requires two-factor auth, pass the code through — everything
after `--` reaches `npm publish`:

```bash
npm run release -- --otp=123456
```

**The `--workspace` flag is not optional, and that is the entire reason this is
a script rather than a command you type.** Bare `npm publish` at the repository
root targets the **root manifest** — `/package.json` — and not
`packages/brand/package.json`, which is the one that describes this package.
The two currently share the name `@codecavepro/brand`, so the distinction is by
path and only by path. It is stopped by the root manifest's `private: true`,
with

```
npm error This package has been marked as private
```

which reads like a problem with the package you meant to publish and is not one.
**Do not remove that `private` field to make the message go away.** It is the
only thing between a mistyped command and 554 files of monorepo on the public
registry, and the package it is refusing to publish is the wrong package
anyway.

Neither rehearsal above catches this. Verified on npm 11.7.0: `npm publish
--dry-run` on a `private` package prints `+ name@version` and exits 0. Step 3
cannot save you here; only the real publish enforces it.

`publishConfig.access` is already `public` in the manifest, so the script's
`--access public` is redundant — it is there so the intent shows up in shell
history. A scoped package defaults to restricted, and a restricted publish under
a free org fails rather than silently going private, but do not rely on that as
the safety net.

Confirm the registry agrees:

```bash
npm view @codecavepro/brand version
```

### 5. Tag and push

```bash
git commit -am "Release @codecavepro/brand 1.0.1" && git tag 1.0.1 && git push && git push --tags
```

**Tags are the bare version — `1.0.1`.** No `v`, no package prefix. Set by
`1.0.0` on 2026-08-21, the repo's first tag.

Tags are annotated (`git tag -a`), not lightweight, so each carries its tagger,
date and a message saying what was in it.

### 6. Close the loop

Comment the version and tag on the CCWEB2-318 phase-5 issue. If this publish
changed a token value, say which — the site consumes these, and a value change
is the only kind of release with downstream work attached.

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
