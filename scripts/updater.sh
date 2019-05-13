#!/usr/bin/env bash

# params validation
if [[ -z "$1" ]]; then
  echo "Tag is empty"
  exit 1
fi

yarn upgrade rcn-diaspore-contract-artifacts@git://github.com/ripio/rcn-diaspore-contract-artifacts.git#$1
yarn upgrade rcn-diaspore-abi-wrappers@git://github.com/ripio/rcn-diaspore-abi-wrappers.git#$1

echo "\nPackages successfully updated..."