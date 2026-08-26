#!/usr/bin/env bash
#
# Render the brand ramps from the three masters in src/logos/.
#
# ONE origin, one destination each. The masters are the only authored artwork
# in this repository; everything under docs/logos/, docs/icons/ and
# docs/favicons/ is this script's output, tracked so a consumer can take a PNG
# without a rasteriser. Those files used to exist two and three times over --
# at the repository root AND under docs/ as hand-made copies that nothing
# derived and nothing checked -- so a re-render updated one home and left the
# others silently saying something else.
#
# It needs Inkscape and ImageMagick, which is why it is a shell script and why
# it is not wired into `npm run build`: a machine without them cannot run it,
# and the tracked output is the record of the last run.

set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
masters="$root/src/logos"
out_logos="$root/docs/logos"
out_icons="$root/docs/icons"
out_favicons="$root/docs/favicons"

for tool in inkscape convert; do
  command -v "$tool" >/dev/null 2>&1 || {
    echo "generate-brand-assets: '$tool' is not installed." >&2
    echo "Needs Inkscape and ImageMagick. The tracked output under docs/logos/," >&2
    echo "docs/icons/ and docs/favicons/ is the last run's result." >&2
    exit 1
  }
done

logo_sizes=("96" "128" "256" "300" "350" "500" "600" "1024")
icon_sizes=("16" "32" "64" "96" "128" "256" "512")

mkdir -p "$out_logos" "$out_icons" "$out_favicons"
rm -f "$out_logos"/*.png "$out_icons"/*.png
cd "$out_logos"

# The masters are published alongside the ramps: the site offers the vectors.
cp "$masters/codecave.svg" "$masters/codecave-wide.svg" "$masters/codecave-tall.svg" .

# Square logos
inkscape --export-type png --export-filename codecave.png -w 1024 -d 600 "$masters/codecave.svg"
for size in "${logo_sizes[@]}"; do
  size2="$(($size * 85 / 100 ))"
  skew="$(($size / 10 ))"
  convert codecave.png -density 600 -background none -gravity center -scale ${size2}x${size2} -extent ${size}x${size} -crop ${size}x${size}+0+${skew} codecave-${size}x${size}.png
  convert codecave-${size}x${size}.png -density 600 -background none -gravity center -extent ${size}x${size} codecave-${size}x${size}.png
done
rm codecave.png

# Wide and tall wordmarks, four ink variants each
for shape in wide tall; do
  if [ "$shape" = wide ]; then border="5%x20%"; else border="15%x10%"; fi
  inkscape --export-type png --export-filename codecave-${shape}.png -w 1024 -d 600 "$masters/codecave-${shape}.svg"
  for size in "${logo_sizes[@]}"; do
    stem="codecave-${shape}-${size}"
    convert codecave-${shape}.png -density 600 -gravity center -scale ${size} -bordercolor transparent -border ${border} -format png -compose copy -background none ${stem}-text-white.png
    convert ${stem}-text-white.png -density 600 -alpha off -fill black -opaque white -alpha on ${stem}-text-black.png
    convert ${stem}-text-white.png -threshold 100% ${stem}-all-black.png
    convert ${stem}-all-black.png -alpha off -negate -alpha on ${stem}-all-white.png
  done
  rm codecave-${shape}.png
done

# Icons
cd "$out_icons"
inkscape --export-type png --export-filename codecave.png -w 1024 -d 600 "$masters/codecave.svg"
size_icon=""
for size in "${icon_sizes[@]}"; do
  size2="$(($size * 90 / 100 ))"
  skew="$(($size / 10 ))"
  convert codecave.png -density 600 -background none -gravity center -scale ${size2}x${size2} -extent ${size}x${size} -crop ${size}x${size}+0+${skew} ${size}x${size}.png
  convert ${size}x${size}.png -density 600 -background none -gravity center -extent ${size}x${size} ${size}x${size}.png
  size_icon="$(pwd)/${size}x${size}.png"
done
rm codecave.png

# Favicons and the web runtime set
cd "$out_favicons"
rm -f ./*.png ./*.ico
convert "${size_icon}" -density 600 -background none -scale 180x180 apple-touch-icon.png
convert "${size_icon}" -density 600 -background none -scale 96x96 favicon-96x96.png
convert "${size_icon}" -density 600 -background none -scale 192x192 web-app-manifest-192x192.png
convert "${size_icon}" -density 600 -background none -scale 512x512 web-app-manifest-512x512.png
convert "${size_icon}" -background none -define icon:auto-resize=16,32,48 favicon.ico
inkscape "$masters/codecave.svg" --actions "select-all:all;page-fit-to-selection;fit-canvas-to-selection" --export-margin=30 -o favicon.svg

echo "brand assets rendered into docs/logos/, docs/icons/ and docs/favicons/."
