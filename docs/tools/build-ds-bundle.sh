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
# This script touches ONLY the derived files, which are the ones .gitignore
# ignores. It never writes README.md, styles.css, guidelines/brand.md or the
# Foundations cards: those are authored source, they are tracked, and they have
# no upstream in docs/ to be regenerated from.
#
#   sh docs/tools/build-ds-bundle.sh

set -eu

root=$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)
src="$root/docs"
dst="$root/ds-bundle"

[ -d "$src" ] || { echo "no docs/ at $src" >&2; exit 1; }
[ -d "$dst" ] || { echo "no ds-bundle/ at $dst — this script refreshes it, it does not create it" >&2; exit 1; }

mkdir -p "$dst/tokens" "$dst/fonts"

cp "$src/colors_and_type.css" "$dst/colors_and_type.css"
cp "$src/tokens/colors.ts" "$src/tokens/layout.ts" "$src/tokens/typography.ts" "$dst/tokens/"
cp "$src/fonts/fonts.css" "$dst/fonts/"
for f in "$src"/fonts/*.woff "$src"/fonts/*.woff2; do
  [ -e "$f" ] && cp "$f" "$dst/fonts/"
done

# Verify rather than trust. A copy that silently failed is the failure mode this
# whole script exists to close, so prove every pair byte-identical before exiting 0.
drift=0
check() {
  if cmp -s "$src/$1" "$dst/$1"; then
    :
  else
    echo "DRIFT  $1" >&2
    drift=1
  fi
}
check colors_and_type.css
for t in colors layout typography; do check "tokens/$t.ts"; done
check fonts/fonts.css
for f in "$dst"/fonts/*.woff "$dst"/fonts/*.woff2; do
  [ -e "$f" ] && check "fonts/$(basename "$f")"
done

[ "$drift" -eq 0 ] || { echo "ds-bundle is NOT in sync with docs/" >&2; exit 1; }
echo "ds-bundle derived files match docs/ (stylesheet, 3 token modules, fonts.css, $(ls "$dst"/fonts/*.woff "$dst"/fonts/*.woff2 2>/dev/null | wc -l | tr -d ' ') font binaries)"
