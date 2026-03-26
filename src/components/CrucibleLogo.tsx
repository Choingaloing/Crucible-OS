/**
 * Crucible brand logo icon — pouring crucible with golden drip.
 * Brand colors: Forge Orange #EA5924, Crucible Gold #FFBF29
 */
export function CrucibleIcon({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Crucible body — Forge Orange */}
      <ellipse
        cx="17"
        cy="17"
        rx="14"
        ry="10"
        fill="#EA5924"
        transform="rotate(-18 17 17)"
      />
      {/* Highlight / inner glow */}
      <ellipse
        cx="12"
        cy="12"
        rx="6"
        ry="4"
        fill="#F06B3A"
        opacity="0.65"
        transform="rotate(-18 12 12)"
      />
      {/* Golden drip — Crucible Gold */}
      <path
        d="M22 24 Q24 30 23 36 Q22 40 21 38 Q20 35 21 30 Q21.5 26 22 24Z"
        fill="#FFBF29"
      />
      {/* Small golden drip droplet at tip */}
      <circle cx="21.5" cy="39" r="1.5" fill="#FFBF29" />
    </svg>
  )
}

export function CrucibleWordmark({ className = '' }: { className?: string }) {
  return (
    <span
      className={`font-display font-black uppercase tracking-widest text-lg leading-none ${className}`}
      style={{ letterSpacing: '0.12em' }}
    >
      CRUCIBLE
    </span>
  )
}
