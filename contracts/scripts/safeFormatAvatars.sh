#!/bin/bash

set -euo pipefail

create_temp_file() {
    local tempfile
    tempfile=$(mktemp --suffix=".ts")
    if [[ ! $tempfile ]]; then
        echo "Failed to create a temporary file with suffix .ts. Exiting."
        exit 1
    fi
    echo "$tempfile"
}

TMPFILE=$(create_temp_file)
PROCESSED_FILE=$(create_temp_file)

trap 'rm -f "$TMPFILE" "$PROCESSED_FILE"' EXIT

# turn off fail on failure
set +e
# Capture the output of the problematic command
yarn ts-node scripts/formatAvatars.ts > "$TMPFILE" 2>&1
# turn on fail on failure
set -e

# Check for "Error: Missing" in the output
if grep -q "Error: Missing" "$TMPFILE"; then
    echo "Detected missing items. Running correction logic..."

    # Extract missing items and run correction logic...
    missing_items=$(grep "Error: Missing" "$TMPFILE" | awk -F': ' '{print $3}' | sed 's/^ *//;s/ *$//')

    # Your correction logic here...
    IFS=',' read -ra ADDR <<< "$missing_items"
    for item in "${ADDR[@]}"; do
        trimmed_item=$(echo "$item" | awk '{$1=$1;print}')
        echo -e "\t$trimmed_item"
    done

    git add src/avatars/first100
    echo

    # generate a fixup script
    TMP_SED_FILE=$(create_temp_file)
    echo 'sed -i \' | tee "$TMP_SED_FILE"
    git status | grep renamed | grep first100 | sed "s|renamed:    src/avatars/first100|-e 's|g" | sed "s|.json -> src/avatars/first100||g" | sed "s|.json|/g' \\\|" | tee -a "$TMP_SED_FILE"
    echo 'scripts/formatAvatars.ts' | tee -a "$TMP_SED_FILE"

    chmod +x "$TMP_SED_FILE"
    echo
    # execute the script
    "$TMP_SED_FILE"
    echo
    # re-run this script to ensure the fixup worked
    echo "Re-running this script to ensure the fixup worked..."
    "$0"
    exit 0

else
    if grep -q "error" "$TMPFILE"; then
        echo "An unexpected error occurred:"
        cat "$TMPFILE"
        exit 1
    else
        # If the initial command succeeded, then apply the rest of your pipeline
        tac "$TMPFILE" | tail -n +1 | tac | tail -n +2 > "$PROCESSED_FILE"
        # ensure PROCESSED_FILE is at least 100 lines long as sanity check
        if [[ $(wc -l < "$PROCESSED_FILE") -lt 100 ]]; then
            echo "Processed file is too short. Exiting."
            exit 1
        fi

        echo "Processed file is valid. Updating First100.ts..."
        cp "$PROCESSED_FILE" src/avatars/First100.ts
        yarn prettier --config ../.prettierrc --write src/avatars/First100.ts src/avatars/first100
    fi
fi
