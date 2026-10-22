#!/bin/bash
set -euo pipefail

mkdir -p public-dist 

npx tsc

for f in dist/overseer.js dist/worker.js dist/scoricomb.js; do 
	fc="$(echo $f | sed "s/\.js/.min.js/" | sed "s/dist/public-dist/")"
	echo "$f --> $fc ..."
	npx uglifyjs $f -o $fc
	echo "$f --> $fc ... done"
done
