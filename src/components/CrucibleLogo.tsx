/**
 * Crucible brand logo — rounded vessel pouring molten gold.
 * Reconstructed from the official brand mark.
 * Colors: Dark brown #231200, Forge Orange #EA5924, Inner orange #F07030,
 *         Inner glow #F8A060, Crucible Gold #FFD020
 */
export function CrucibleIcon({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Pour stream — dark outline */}
      <path
        d="M44 62 C44 60 46.5 58 50 58 C53.5 58 56 60 56 62 L56 100 L44 100 Z"
        fill="#231200"
      />
      {/* Pour stream — Crucible Gold */}
      <path
        d="M45.5 63 C45.5 61 47.5 59.5 50 59.5 C52.5 59.5 54.5 61 54.5 63 L54.5 100 L45.5 100 Z"
        fill="#FFD020"
      />
      {/* Pour stream — bright center highlight */}
      <path
        d="M49 64 L51 64 L51 100 L49 100 Z"
        fill="#FFE860"
        opacity="0.8"
      />

      {/* Cup outer silhouette — thick dark border */}
      <ellipse cx="50" cy="33" rx="44" ry="35" fill="#231200" />

      {/* Cup main body — Forge Orange */}
      <ellipse cx="50" cy="33" rx="37" ry="28" fill="#EA5924" />

      {/* Interior surface — lighter orange (inside of cup visible through opening) */}
      <path
        fill="#F07030"
        d="M46 7 C34 8 18 16 13 29 C8 42 12 56 22 62 C30 67 40 65 46 61 C38 53 34 43 34 33 C34 23 38 12 46 7Z"
      />

      {/* Rim arc — dark curved edge creating 3D opening effect */}
      <path
        d="M63 6 C77 12 87 22 87 33 C87 44 77 54 63 60"
        stroke="#231200"
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
      />

      {/* Interior glow/highlight — warmth inside the vessel */}
      <ellipse
        cx="30"
        cy="25"
        rx="14"
        ry="9"
        fill="#F8A060"
        opacity="0.65"
      />
    </svg>
  )
}

export function CrucibleWordmark({ className = '' }: { className?: string }) {
  return (
    <span
      className={`font-display font-black uppercase leading-none ${className}`}
      style={{ letterSpacing: '0.08em', fontSize: '1.1em' }}
    >
      CRUCIBLE
    </span>
  )
}
