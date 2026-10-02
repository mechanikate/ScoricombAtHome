#!/bin/bash
set -euo pipefail

mkdir -p public-dist 

for f in public/overseer.js public/worker.js public/scoricomb.js; do 
	fc="$(echo $f | sed "s/\.js/.min.js/" | sed "s/public/public-dist/")"
	echo "$f --> $fc ..."
	npx uglifyjs $f -o $fc
	echo "$f --> $fc ... done"
done
