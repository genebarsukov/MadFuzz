#!/bin/bash
node_modules/.bin/ngc -p tsconfig-aot.json
node_modules/.bin/rollup -c rollup-config.js
