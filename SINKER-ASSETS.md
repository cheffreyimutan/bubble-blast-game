# Sinker artwork

Created with the built-in imagegen tool on 2026-10-11. Existing `pearl-sprites.png` was used only as a style reference; no existing art was replaced.

## Files and consumption

- `sinker-blue-sprites.png`: 1024 × 512, RGBA, four columns × two rows.
- `sinker-clear-sprites.png`: same dimensions and layout.
- `sinker-blue.png` / `sinker-clear.png`: 256 × 256 static frame zero, for How To cards.

Each cell is exactly 256 × 256; row-major index is 0 through 7. Crop `(index % 4) * 256, floor(index / 4) * 256, 256, 256`. Draw the complete cell at approximately 2.2 times the collision radius. Frame zero is the static icon. Frame meanings: neutral, wobble left, half blink, blink closed, neutral, wobble right, worried, relieved.

The clear variant is drawn as glass with alpha-zero surroundings. Its body remains readable; gameplay can apply additional translucency to the complete sprite. Both variants share the same two-hit sinker behavior and are unrelated to ice.

## Generation prompts

Blue: Production 2D mobile game sprite atlas matching the existing glossy kawaii pearl reference. New round sapphire/aqua blue sinker, tiny expressive face and miniature side fins, small pale silver anchor on forehead. Eight isolated same-identity characters in a 4 × 2 grid on an absolutely transparent background, no text/grid/scenery. Row-major expressions: neutral, gentle left wobble, half blink, closed blink, neutral, right wobble, worried, relieved. Same scale, ample padding, no cast shadows or loose sparkles.

Clear: Same atlas specification and reference style, with a clear/glass pearl body, subtle cool rim, reflections, readable tiny face and silver anchor. No flower/crown/opaque stone. Same eight expressions and grid.

Final cleanup prompt for each: Preserve all eight characters, faces, anchors, layout and scale. Fix only background extraction; remove disconnected fragments outside character silhouettes and preserve smooth antialiased edges, transparent alpha outside, no labels/grid/scenery.

Generated outputs were visually inspected, then mechanically split and packed into exact integer cells. Disconnected alpha islands outside each primary character silhouette were discarded during extraction. Character pixels were otherwise preserved, scaled to fit inside 232 × 232, and centered in 256 × 256 cells. Both atlas PNGs retain alpha in the range 0–255 and transparent gutters; static icons match atlas frame zero.
