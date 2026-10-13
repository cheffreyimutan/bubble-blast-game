# Sinker artwork

## Active source

`kawaii-boba-emotes.png` is an unchanged copy of the user's `Kawaii Boba Emote Sprite Atlas.png` (1774 × 887 RGBA), copied into both repository root and `www`. SHA256 for the source and both copies is identical. No redraw, image generation, resampling, or background changes were applied to this file.

The source contains seven flavor rows and twenty expressions per row. Runtime canvas crops use blue row 4 and clear row 6 (zero-based). Existing slate/anchor sinkers remain a third cosmetic variant; missing `sinkerVariant` values preserve that original rendering. All three variants retain the same two adjacent popped-cell damage hits and drop behavior; ice mechanics remain separate.

## Runtime crop geometry

`sinkerCrop(variant, frame)` exposes each source rectangle. Horizontal centers and half-widths reuse the calibrated `PEARL_COL_CENTER` and `PEARL_COL_HALFW` tables in the existing 1125-pixel coordinate system, scaled by the supplied image width. Columns are deliberately nonuniform rather than `width / 20` windows.

Row-specific source-pixel windows exclude captions and neighboring rows while retaining blue topknots and clear flowers:

- Blue: `y = 570`, height `86`.
- Clear: `y = 813`, height `71`.

These windows were checked across all twenty expressions using source alpha bounds. The canvas draws cropped character art at the original pearl renderer's proportions. Clear sinkers use 0.82 rendering alpha; the source image remains unchanged.

## Expressions and How To

All twenty source expressions remain available through the existing `BOBA_POSE` groups: Idle 0–2, Blink 3–4, Happy 5–7, Excited 8–9, Angry 10–11, Sad 12–13, Hit 14–15, Dizzy 16–17, Celebrate 18–19. `sinkerFrame` selects idle/blink normally, happy during a streak, hit while recently worried, and sad after damage. Explicit mood/pose overrides preserve access to all expressions.

How To uses the same canvas renderer and source crops as gameplay, with pose zero for blue and clear examples. It no longer refers to generated static sinker images.

## Superseded historical files

`sinker-blue-sprites.png`, `sinker-clear-sprites.png`, `sinker-blue.png`, and `sinker-clear.png` are the previous generated artwork. They remain as historical files pending repository cleanup, but active gameplay and How To contain no references to them.