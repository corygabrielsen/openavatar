#!/usr/bin/env bash

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
echo "Script dir: ${SCRIPT_DIR}"
# script dir should end in assets/scripts
if [ "$(basename ${SCRIPT_DIR})" != "scripts" ]; then
        echo "This script must be run from the assets/scripts directory"
        exit 1
fi
PROJECT_DIR=$(realpath "${SCRIPT_DIR}/..")
STRLEN=${#PROJECT_DIR}
ARTIFACTS_DIR=$(realpath "${SCRIPT_DIR}/../artifacts")
SPRITES=${ARTIFACTS_DIR}/sprites
SPRITESHEETS=${ARTIFACTS_DIR}/spritesheets
DIR=${SPRITES}/hair
OUTDIR=${DIR}/../../art/hair
mkdir -p ${OUTDIR}
OUTDIR=$(realpath "${OUTDIR}")


mk_img() {
        # crop the upper 32x32 of the corresponding spritesheet
        TMPFILE=$(mktemp)
        convert ${SPRITESHEETS}/hair/hair__afro__${1}.png -crop 32x32+0+0 $TMPFILE

        # now stitch them together
        convert  $TMPFILE $DIR/hair__afro__${1}.png $DIR/hair__bowl__${1}.png $DIR/hair__fade__${1}.png $DIR/hair__dreads__${1}.png +append $DIR/hair__${1}__row1.png
        convert  $TMPFILE $DIR/hair__medium__${1}.png $DIR/hair__messy__${1}.png $DIR/hair__mohawk__${1}.png $DIR/hair__wild__${1}.png +append $DIR/hair__${1}__row2.png
        convert $DIR/hair__${1}__row1.png $DIR/hair__${1}__row2.png -append ${OUTDIR}/hair__${1}.png
        echo "${OUTDIR}/hair__${1}.png" | cut -c $((STRLEN+2))-
}

mk_all() {
        mk_img dyed_blue_green
}
mk_all
