#!/bin/bash

set -e

script_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
artifacts_dir="${script_dir}/../artifacts"


# Define the array of files
files=(
"${artifacts_dir}/OwnerProxy.create2.json"
"${artifacts_dir}/OpenAvatarGen0Assets.create2.json"
"${artifacts_dir}/OpenAvatarGen0RendererRegistry.create2.json"
"${artifacts_dir}/OpenAvatarGen0Renderer.create2.json"
"${artifacts_dir}/OpenAvatarGen0Token.create2.json"
"${artifacts_dir}/OpenAvatarGen0TextRecords.create2.json"
"${artifacts_dir}/OpenAvatarGen0ProfilePictureRenderer.create2.json"
)

i=1
# Loop over the files array
for file in "${files[@]}"; do
    deployer=$(jq -r .signer "$file")
    filename=$(basename -- "$file")
    filename="${filename%.*}"
    filename="${filename%.*}"
    echo -e "\e[1m\e[32m# $i. ${filename}\e[0m \e[90m(${deployer})\e[0m"
    echo -e "\e[34m# INIT_CODE_HASH=\e[0m"$(jq -r .address.initCodeHash $file)
    echo
    ((i++))
done
