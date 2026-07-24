/**
 * @description Curved "screen" cue rendered above the seat grid — the classic
 * cinema-seat-map signal that this is a real seating chart, not a generic form.
 * Pure decoration (aria-hidden); the arc + glow are a single inline SVG so they
 * render identically regardless of the ambient light/dark theme.
 */
export const ScreenIndicator = () => {
  return (
    <div className="flex flex-col items-center gap-1.5" aria-hidden="true">
      <svg viewBox="0 0 400 32" className="h-8 w-full max-w-sm text-indigo-400">
        <path
          d="M0 4 Q200 32 400 4"
          fill="none"
          stroke="url(#screen-glow)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="screen-glow" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.15" />
            <stop offset="50%" stopColor="currentColor" stopOpacity="0.9" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.15" />
          </linearGradient>
        </defs>
      </svg>
      <span className="text-[10px] font-medium tracking-[0.3em] text-zinc-500 uppercase">
        Screen this way
      </span>
    </div>
  )
}
