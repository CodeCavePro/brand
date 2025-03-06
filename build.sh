logo_sizes=("96" "128" "256" "300" "350" "500" "600" "1024")
icon_sizes=("16" "32" "64" "96" "128" "256" "512")

mkdir -pv logos
rm -v logos/*
cd logos

# Create square logos
inkscape --export-type png --export-filename codecave.png -w 1024 -d 600 ../src/codecave.svg
for size in "${logo_sizes[@]}"; do
  size2="$(($size * 80 / 100 ))"
  skew="$(($size / 10 ))"
  convert codecave.png -density 600 -background none -gravity center -scale ${size2}x${size2} -extent ${size}x${size} -crop ${size}x${size}+0+${skew} codecave-${size}x${size}.png
  convert codecave-${size}x${size}.png -density 600 -background none -gravity center -extent ${size}x${size} codecave-${size}x${size}.png
done
rm codecave.png

# Create wide logos
inkscape --export-type png --export-filename codecave-wide.png -w 1024 -d 600 ../src/codecave-wide.svg
for size in "${logo_sizes[@]}"; do
  convert codecave-wide.png -density 600 -gravity center -scale ${size} -bordercolor transparent -border 5%x20% -format png -compose copy -background none codecave-wide-${size}-text-white.png
  convert codecave-wide-${size}-text-white.png -density 600 -alpha off -fill black -opaque white -alpha on codecave-wide-${size}-text-black.png
  convert codecave-wide-${size}-text-white.png -threshold 100% codecave-wide-${size}-all-black.png
  convert codecave-wide-${size}-all-black.png -alpha off -negate -alpha on codecave-wide-${size}-all-white.png
done
rm codecave-wide.png

# Create tall logos
inkscape --export-type png --export-filename codecave-tall.png -w 1024 -d 600 ../src/codecave-tall.svg
for size in "${logo_sizes[@]}"; do
  convert codecave-tall.png -density 600 -gravity center -scale ${size} -bordercolor transparent -border 15%x10% -format png -compose copy -background none codecave-tall-${size}-text-white.png
  convert codecave-tall-${size}-text-white.png -density 600 -alpha off -fill black -opaque white -alpha on codecave-tall-${size}-text-black.png
  convert codecave-tall-${size}-text-white.png -threshold 100% codecave-tall-${size}-all-black.png
  convert codecave-tall-${size}-all-black.png -alpha off -negate -alpha on codecave-tall-${size}-all-white.png
done
rm codecave-tall.png

cd ..
mkdir -pv icons
rm -v icons/*
cd icons

# Create icons
inkscape --export-type png --export-filename codecave.png -w 1024 -d 600 ../src/codecave.svg
size_icon=""
for size in "${icon_sizes[@]}"; do
  size2="$(($size * 80 / 100 ))"
  skew="$(($size / 10 ))"
  convert codecave.png -density 600 -background none -gravity center -scale ${size2}x${size2} -extent ${size}x${size} -crop ${size}x${size}+0+${skew} ${size}x${size}.png
  convert ${size}x${size}.png -density 600 -background none -gravity center -extent ${size}x${size} ${size}x${size}.png
  size_icon="$(pwd)/${size}x${size}.png"
done
rm codecave.png

cd ..
mkdir -pv favicons
rm -v favicons/*.{png,svg,ico}
cd favicons

# Create favicons
convert ${size_icon} -density 600 -background none -scale 180x180 apple-touch-icon.png
convert ${size_icon} -density 600 -background none -scale 96x96 favicon-96x96.png
convert ${size_icon} -density 600 -background none -scale 192x192 web-app-manifest-192x192.png
convert ${size_icon} -density 600 -background none -scale 512x512 web-app-manifest-512x512.png
convert ${size_icon} -background none -define icon:auto-resize=16,32,48 favicon.ico
inkscape ../src/codecave.svg --actions "select-all:all;page-fit-to-selection;fit-canvas-to-selection" --export-margin=30 -o favicon.svg
