/**
 * Layers-inspired cinematic motion experiment.
 *
 * REVERT (pick one):
 * 1. Instant off: set LAYERS_MOTION_EXPERIMENT to false below
 * 2. Branch off:  git checkout main
 * 3. Discard:     git checkout main -- src/components/cobreo/motion-flags.ts
 *                 src/components/cobreo/layers-*.tsx src/components/cobreo/home-page.tsx
 *                 (or delete layers-* files and set flag false)
 */
export const LAYERS_MOTION_EXPERIMENT = true;

/**
 * Shader / particle logo textures (hero rings, watermarks).
 * Set to false to fall back to plain SVG images.
 */
export const SHADER_MARKS_EXPERIMENT = false;
