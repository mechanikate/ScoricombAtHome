#!/bin/bash
set -euo pipefail

for f in public/overseer.js public/worker.js public/scoricomb.js; do 
	fc="$(echo $f | sed "s/\.js/.min.js/")"
	echo "$f --> $fc ..."
	uglifyjs $f -o $fc
	echo "$f --> $fc ... done"
done
