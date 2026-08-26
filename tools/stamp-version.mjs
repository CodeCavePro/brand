/* Write the version being released into packages/brand/package.json.
 *
 *   node tools/stamp-version.mjs                 derive it, or leave 0.0.0
 *   node tools/stamp-version.mjs --require-tag   derive it, or fail
 *   node tools/stamp-version.mjs --version 2.3.0 use this one
 *   node tools/stamp-version.mjs --check         say what it would do, write nothing
 *
 * THE TAG IS THE VERSION. The manifest is committed as 0.0.0 and carries no
 * version between releases, so there is no second place to bump and nothing to
 * forget: `git push origin 2.3.0` names 2.3.0 and this script puts it where npm
 * reads it. That inverts what RELEASING.md used to ask for — a hand-run
 * `npm version` before the tag — which failed the obvious way the first time
 * nobody ran it: the tag said 2.3.0, the manifest still said 2.2.0, and the
 * release refused itself.
 *
 * WHY THIS IS NOT A `prepack` HOOK, which is where it belongs by shape and
 * where it is wrong by behaviour. npm resolves the tarball's NAME from the
 * manifest before running prepack, and packs the manifest as prepack left it.
 * Measured, on this repo's npm:
 *
 *     prepack sets 9.9.9  ->  vertest-0.0.0.tgz  whose package.json says 9.9.9
 *
 * So a prepack stamp produces a tarball whose filename and contents disagree,
 * and which of the two `npm publish` sends the registry is not a thing to find
 * out by burning a version number. Stamping has to happen BEFORE npm is
 * invoked — hence its own step in release.yml, and the `&&` in the root
 * `release:package` script rather than a lifecycle hook.
 *
 * Nothing commits the result. The release runs on a throwaway checkout, and a
 * stamped manifest in a working tree is a dirty file to discard, not a change
 * to keep — see RELEASING.md.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = path.join(repo, 'packages', 'brand', 'package.json');

/* The same shape release.yml triggers on. Deliberately no prerelease suffix:
 * the workflow's tag filter would not start a run for one, so accepting it
 * here would only produce a version that can be stamped and never released. */
const SEMVER = /^[0-9]+\.[0-9]+\.[0-9]+$/;
const UNSET = '0.0.0';

const argv = process.argv.slice(2);
const flag = (name) => argv.includes(name);
const value = (name) => {
  const i = argv.indexOf(name);
  return i === -1 ? null : argv[i + 1];
};

const die = (title, ...lines) => {
  console.error(`stamp-version: ${title}`);
  for (const l of lines) console.error(`  ${l}`);
  process.exit(1);
};

/* Where the version comes from, most explicit first. In CI the tag arrives as
 * GITHUB_REF_NAME and there is no checkout guarantee that `git describe` would
 * work off — actions/checkout fetches one commit by default, so asking git
 * about tags there answers "no tag" for a run started BY a tag. */
function resolve() {
  const explicit = value('--version');
  if (explicit) return { version: explicit, from: '--version' };

  if (process.env.GITHUB_REF_TYPE === 'tag' && process.env.GITHUB_REF_NAME) {
    return { version: process.env.GITHUB_REF_NAME, from: 'GITHUB_REF_NAME' };
  }

  try {
    const tag = execFileSync('git', ['describe', '--tags', '--exact-match', 'HEAD'], {
      cwd: repo,
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim();
    if (tag) return { version: tag, from: 'the tag on HEAD' };
  } catch {
    /* HEAD is not tagged, or this is not a git checkout. Both mean the same
     * thing here: there is no release in progress. */
  }
  return null;
}

const found = resolve();

if (!found) {
  if (flag('--require-tag')) {
    die(
      'HEAD is not tagged, so there is no version to publish.',
      'A release is a pushed tag. Tag the commit first:',
      '',
      '    git tag -a 2.3.0 -m "Release 2.3.0 — <what changed>"',
      '    git push origin 2.3.0',
      '',
      'Pushing the tag runs the release; publishing by hand is the fallback in',
      'RELEASING.md, not the route.',
    );
  }
  console.log(`stamp-version: HEAD is not tagged — leaving the manifest at ${UNSET}.`);
  console.log('  That is a build, not a release. Nothing publishable was produced.');
  process.exit(0);
}

const { version, from } = found;

if (!SEMVER.test(version)) {
  die(
    `"${version}" (from ${from}) is not a bare version.`,
    'Tags in this repo are the version and nothing else — 2.3.0, not v2.3.0 and',
    'not brand-2.3.0. release.yml only triggers on the bare form, so a tag that',
    'reaches this message could never have started a release anyway.',
  );
}

const before = fs.readFileSync(manifest, 'utf8');

/* Replace the line rather than round-tripping the JSON: this file is authored,
 * it is one of the three tracked files under packages/, and a reformat would
 * turn a one-line release-time diff into a whole-file one. */
const line = /^(\s*"version":\s*")([^"]*)(",?\s*)$/m;
const match = before.match(line);
if (!match) die('packages/brand/package.json has no "version" line to stamp.');

const current = match[2];
const after = before.replace(line, `$1${version}$3`);

if (flag('--check')) {
  console.log(`stamp-version: would set ${current} -> ${version} (from ${from}).`);
  process.exit(0);
}

if (current === version) {
  console.log(`stamp-version: packages/brand/package.json already says ${version} (from ${from}).`);
  process.exit(0);
}

fs.writeFileSync(manifest, after);
console.log(`stamp-version: packages/brand/package.json ${current} -> ${version} (from ${from}).`);
