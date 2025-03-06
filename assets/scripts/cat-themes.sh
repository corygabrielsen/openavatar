#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
dir="$SCRIPT_DIR/../assets/palettes/base/themes"

# Specific list of filenames you want to process
filenames=(
  "theme__009__punk_pop.pal"
  "theme__015__pastel_daydream.pal"
  "theme__022__sunset.pal"
  "theme__028__fire_and_ice.pal"
  "theme__030__hippy_harmony.pal"
  "theme__032__tropical_punch.pal"
  "theme__041__pastel_paradise.pal"
  "theme__048__rainforest_canopy.pal"
  "theme__051__autumn_serenade.pal"
  "theme__055__jungle_canopy.pal"
  "theme__056__aurora_tides.pal"
  "theme__058__summer_solstice.pal"
  "theme__071__earth_and_sky.pal"
  "theme__083__cybershock.pal"
  "theme__089__electric_rain.pal"
  "theme__092__cyberpunk.pal"
  "theme__104__coral_reef.pal"
  "theme__105__winter_whispers.pal"
  "theme__106__celestial_haze.pal"
  "theme__113__cotton_candy.pal"
  "theme__122__cyberpink.pal"
)

# Loop over each specific filename
for name in "${filenames[@]}"; do
    file="$dir/$name"

    if [[ -f "$file" ]]; then
        echo
        echo "$(basename $file)" | cut -c 13-
        echo "\`\`\`"
        cat "$file"
        echo "\`\`\`"
        echo
    else
        echo "Warning: $file does not exist or is not a regular file."
    fi
done
