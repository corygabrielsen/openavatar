#!/usr/bin/env bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
ARIFACTS_DIR=$(realpath $SCRIPT_DIR/../artifacts)

# should be exactly one argument
if [ $# -ne 1 ]; then
    echo "Usage: $0 <contract_name>"
    exit 1
fi

# $ git clone https://github.com/0age/create2crunch
# $ cd create2crunch
# $ export FACTORY="0xa779284f095ef2eBb8ee26cd8384e49C57b26996"
# $ export CALLER="<YOUR_ROPSTEN_ADDRESS_OF_CHOICE_GOES_HERE>"
# $ export INIT_CODE_HASH="<HASH_OF_YOUR_CONTRACT_INIT_CODE_GOES_HERE>"
# $ cargo run --release $FACTORY $CALLER $INIT_CODE_HASH

export FACTORY="0x5FbDB2315678afecb367f032d93F642f64180aa3"

# test test test test test test test test test test test junk
# m/44'/60'/0'/0/0
export CALLER="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"

JSON_PATH="${ARIFACTS_DIR}/${1}.create2.json"
export INIT_CODE_HASH=$(jq -r '.address.initCodeHash' ${JSON_PATH})

echo "export FACTORY=${FACTORY}"
echo "export CALLER=${CALLER}"
echo "export INIT_CODE_HASH=${INIT_CODE_HASH}"

