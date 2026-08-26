#!/bin/sh
# Materialize the DERIVED half of ds-bundle/ from docs/.
#
# Run this before every DesignSync push. The derived files are plain copies with
# no transformation, which is exactly why they drift: nothing fails when they go
# stale, and a stale copy uploads just as cleanly as a fresh one. On 2026-08-20
# ds-bundle/colors_and_type.css was found two real declarations behind its source
# (`flex: none` on the checkbox box, `border-radius: 0.25rem` on the chip) — both
# shape fixes, both silently absent from the design system for weeks.
#
# Since 2026-08-24 it also carries what the COMPONENT cards need, which is the
# same machinery the storybook uses: tw-bridge.css, the vendored vue and gsap
# runtimes, and the compiled component bundles. Those cards mount the real
# compiled SFC rather than redrawing it, so the bundles are as derived as the
# stylesheet is -- and drift the same silent way. A card whose bundle is stale
# renders an old component and says nothing.
#
# This script touches ONLY the derived files, which are the ones .gitignore
# ignores. It never writes README.md, styles.css, guidelines/brand.md or the
# Foundations cards: those are authored source, they are tracked, and they have
# no upstream in docs/ to be regenerated from. The component cards under
# components/Components/ are generated separately, by
# docs/tools/build-ds-components.mjs -- run that after this.
#
#   sh docs/tools/build-ds-bundle.sh && node docs/tools/build-ds-components.mjs

set -eu

root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
src="$root/docs"
# The stylesheet, the token modules and the fonts are authored, so they live in
# src/ now; the compiled bundles and tw-bridge.css are output and stay in docs/.
srcs="$root/src"
dst="$root/ds-bundle"

[ -d "$src" ] || { echo "no docs/ at $src" >&2; exit 1; }
[ -d "$dst" ] || { echo "no ds-bundle/ at $dst — this script refreshes it, it does not create it" >&2; exit 1; }

mkdir -p "$dst/tokens" "$dst/fonts" "$dst/vendor/gsap" "$dst/compiled"

cp "$srcs/styles/colors_and_type.css" "$dst/colors_and_type.css"
cp "$srcs/tokens/colors.ts" "$srcs/tokens/layout.ts" "$srcs/tokens/typography.ts" "$dst/tokens/"
cp "$srcs/fonts/fonts.css" "$dst/fonts/"
for f in "$srcs"/fonts/*.woff "$srcs"/fonts/*.woff2; do
  [ -e "$f" ] && cp "$f" "$dst/fonts/"
done

# What the component cards mount. Only the bundles a card actually references
# are copied: shipping ArticlePreview.js with no card pointing at it would be
# weight nobody can see, and the card generator fails loudly if one is missing.
cp "$src/storybook/tw-bridge.css" "$dst/tw-bridge.css"
cp "$src/vendor/vue.esm-browser.prod.js" "$dst/vendor/"
cp "$src"/vendor/gsap/*.js "$dst/vendor/gsap/"
CARDS='Button GlowButton Checkbox Radio InputText TextField TypingEffect'
for c in $CARDS; do
  cp "$src/storybook/compiled/$c.js" "$dst/compiled/$c.js"
done

# Verify rather than trust. A copy that silently failed is the failure mode this
# whole script exists to close, so prove every pair byte-identical before exiting 0.
drift=0
# Two forms, because the origins are now two roots: check() takes one path
# under docs/, pair() takes the origin and the destination separately for the
# authored files that moved to src/ and are published under a different name.
pair() {
  if cmp -s "$1" "$dst/$2"; then
    :
  else
    echo "DRIFT  $2" >&2
    drift=1
  fi
}
check() {
  if cmp -s "$src/$1" "$dst/$1"; then
    :
  else
    echo "DRIFT  $1" >&2
    drift=1
  fi
}
pair "$srcs/styles/colors_and_type.css" colors_and_type.css
for t in colors layout typography; do pair "$srcs/tokens/$t.ts" "tokens/$t.ts"; done
pair "$srcs/fonts/fonts.css" fonts/fonts.css
for f in "$dst"/fonts/*.woff "$dst"/fonts/*.woff2; do
  [ -e "$f" ] && pair "$srcs/fonts/$(basename "$f")" "fonts/$(basename "$f")"
done
cmp -s "$src/storybook/tw-bridge.css" "$dst/tw-bridge.css" || { echo "DRIFT  tw-bridge.css" >&2; drift=1; }
cmp -s "$src/vendor/vue.esm-browser.prod.js" "$dst/vendor/vue.esm-browser.prod.js" \
  || { echo "DRIFT  vendor/vue.esm-browser.prod.js" >&2; drift=1; }
for f in "$dst"/vendor/gsap/*.js; do
  b=$(basename "$f")
  cmp -s "$src/vendor/gsap/$b" "$f" || { echo "DRIFT  vendor/gsap/$b" >&2; drift=1; }
done
for c in $CARDS; do
  cmp -s "$src/storybook/compiled/$c.js" "$dst/compiled/$c.js" \
    || { echo "DRIFT  compiled/$c.js" >&2; drift=1; }
done

[ "$drift" -eq 0 ] || { echo "ds-bundle is NOT in sync with docs/" >&2; exit 1; }
echo "ds-bundle derived files match src/ and docs/ (stylesheet, 3 token modules, fonts.css, $(ls "$dst"/fonts/*.woff "$dst"/fonts/*.woff2 2>/dev/null | wc -l | tr -d ' ') font binaries, tw-bridge.css, $(( 1 + $(ls "$dst"/vendor/gsap/*.js 2>/dev/null | wc -l | tr -d ' ') )) vendor runtime file(s), $(ls "$dst"/compiled/*.js 2>/dev/null | wc -l | tr -d ' ') compiled component bundle(s))"
