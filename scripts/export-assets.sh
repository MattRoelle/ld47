#!/bin/bash

# bg-water-1
# bg-water-spin-1
# center-plate
# bg-wall-1
# player-innertube
# player-base
# player-head
# player-head-glass
# player-eyes
# claw
# bg-outer-1

for layer in $(aseprite -b --list-layers ./ase/mockup.aseprite); do
    if [[ $layer = bg* ]]
    then
        aseprite -b --layer $layer ./ase/mockup.aseprite --save-as "./game/assets/export-{layer}.png"
    else
        aseprite -b --layer $layer --trim ./ase/mockup.aseprite --save-as "./game/assets/export-{layer}.png"
    fi
done

# aseprite -b --split-layers ./ase/mockup.aseprite --save-as "./game/assets/export-{layer}.png"
for f in $(ls -l ./game/assets/ | grep export | cut -d":" -f2 | cut -d" " -f2); do
    fn=$(echo $f | sed -e's/export-//' | sed -e's/\.png//')
    echo 'this.load.image("'$fn'", "/assets/'$f'");'
done
