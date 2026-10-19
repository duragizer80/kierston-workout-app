import type { BodyTag } from '../lib/tags'

type Props = {
  selected: BodyTag[]
  onToggle: (tag: BodyTag) => void
  /** Regions available in the library (hide empty if you want). */
  available?: BodyTag[]
}

type Region = {
  id: BodyTag
  label: string
  d: string
  /** Which figure the hit target belongs to */
  figure: 'front' | 'back'
}

const REGIONS: Region[] = [
  {
    id: 'Shoulders',
    label: 'Shoulders',
    figure: 'front',
    d: 'M38 58c6-12 16-18 32-18s26 6 32 18l-8 12c-6-6-14-10-24-10s-18 4-24 10z',
  },
  {
    id: 'Chest',
    label: 'Chest',
    figure: 'front',
    d: 'M46 72c8-4 18-6 24-6s16 2 24 6l-4 28c-6 4-14 6-20 6s-14-2-20-6z',
  },
  {
    id: 'Arms',
    label: 'Arms',
    figure: 'front',
    d: 'M32 64c-14 6-22 22-24 42l14 4c2-14 8-26 16-32zm76 0c14 6 22 22 24 42l-14 4c-2-14-8-26-16-32z',
  },
  {
    id: 'Core',
    label: 'Core',
    figure: 'front',
    d: 'M54 104h32c2 14 2 26-2 38H56c-4-12-4-24-2-38z',
  },
  {
    id: 'Legs',
    label: 'Legs',
    figure: 'front',
    d: 'M52 144c-2 22-4 44-2 66h18c0-22 2-44 4-66zm28 0c2 22 4 44 4 66h18c2-22 0-44-2-66z',
  },
  {
    id: 'Back',
    label: 'Back',
    figure: 'back',
    d: 'M168 70c6-4 14-6 20-6s14 2 20 6l-2 56c-6 8-14 12-18 12s-12-4-18-12z',
  },
]

export function BodyMap({ selected, onToggle, available }: Props) {
  const allowed = available ? new Set(available) : null

  return (
    <div className="body-map" role="group" aria-label="Body map filters">
      <svg
        className="body-map-svg"
        viewBox="0 0 240 230"
        width="100%"
        height="auto"
      >
        <title>Tap a body region to filter workouts</title>

        {/* Front outline */}
        <path
          className="body-map-outline"
          d="M70 22c12 0 20 8 20 20v8c16 6 28 22 32 42l-14 6c-4-14-12-26-22-30v14c14 8 22 24 24 44l-2 38c-2 6-6 10-12 10h-6v44c0 6-4 12-12 12H68c-6 0-12-6-12-12v-44h-6c-6 0-10-4-12-10l-2-38c2-20 10-36 24-44V68c-10 4-18 16-22 30L26 92c4-20 16-36 32-42V42c0-12 8-20 20-20z"
        />
        <text x="70" y="218" className="body-map-caption">
          Front
        </text>

        {/* Back outline (simplified) */}
        <path
          className="body-map-outline"
          d="M188 28c10 0 16 6 16 16v6c12 4 20 16 22 30l-12 4c-2-10-8-18-16-22v10c10 6 16 18 18 32l-2 28c0 6-4 8-10 8h-4v36c0 6-4 10-10 10h-12c-6 0-10-4-10-10v-36h-4c-6 0-10-2-10-8l-2-28c2-14 8-26 18-32V62c-8 4-14 12-16 22l-12-4c2-14 10-26 22-30V44c0-10 6-16 16-16z"
        />
        <text x="188" y="218" className="body-map-caption">
          Back
        </text>

        {REGIONS.map((r) => {
          if (allowed && !allowed.has(r.id)) return null
          const on = selected.includes(r.id)
          return (
            <path
              key={r.id}
              d={r.d}
              className={`body-map-region${on ? ' on' : ''}`}
              role="button"
              tabIndex={0}
              aria-label={`Filter ${r.label}`}
              aria-pressed={on}
              onClick={() => onToggle(r.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onToggle(r.id)
                }
              }}
            />
          )
        })}
      </svg>
      <div className="body-map-legend">
        {REGIONS.map((r) => {
          if (allowed && !allowed.has(r.id)) return null
          const on = selected.includes(r.id)
          return (
            <button
              key={r.id}
              type="button"
              className={`body-map-chip${on ? ' on' : ''}`}
              aria-pressed={on}
              onClick={() => onToggle(r.id)}
            >
              {r.label}
            </button>
          )
        })}
      </div>
      <p className="body-map-hint">Tap a region — same filters as the body chips</p>
    </div>
  )
}
