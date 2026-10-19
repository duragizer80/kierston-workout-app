import type { BodyTag } from '../lib/tags'

type Props = {
  selected: BodyTag[]
  onToggle: (tag: BodyTag) => void
  available?: BodyTag[]
}

type Hit = {
  key: string
  id: BodyTag
  label: string
  d: string
}

/**
 * Anatomical front/back body map for library filters.
 *
 * ~8-head proportions, continuous silhouette outline, soft regional fills.
 * Original hand-authored geometry — not copied from proprietary/AGPL UIs.
 *
 * Front @ x=70, back @ x=210. ViewBox 0 0 280 250.
 */

/** Continuous silhouette from key anatomical landmarks (one closed path). */
function silhouette(cx: number): string {
  // Point helpers relative to centerline
  const x = (dx: number) => cx + dx
  return [
    // Head (oval)
    `M${x(0)} 10`,
    `C${x(11)} 10 ${x(18)} 18 ${x(18)} 28`,
    `C${x(18)} 36 ${x(12)} 42 ${x(5)} 44`,
    // Neck → right shoulder
    `L${x(5)} 48`,
    `C${x(14)} 49 ${x(24)} 52 ${x(28)} 58`,
    // Right arm outer → hand → inner
    `C${x(34)} 72 ${x(36)} 90 ${x(35)} 108`,
    `C${x(35)} 116 ${x(32)} 122 ${x(27)} 124`,
    `C${x(24)} 125 ${x(21)} 123 ${x(21)} 119`,
    `C${x(21)} 102 ${x(20)} 86 ${x(18)} 74`,
    `C${x(17)} 66 ${x(14)} 60 ${x(10)} 58`,
    // Right torso side → hip
    `C${x(12)} 72 ${x(13)} 88 ${x(12)} 104`,
    `C${x(11)} 112 ${x(12)} 118 ${x(14)} 122`,
    // Right leg outer → foot → inner
    `C${x(16)} 145 ${x(15)} 168 ${x(14)} 190`,
    `C${x(14)} 200 ${x(15)} 208 ${x(17)} 214`,
    `C${x(18)} 218 ${x(16)} 222 ${x(11)} 222`,
    `L${x(4)} 222`,
    `C${x(1)} 222 ${x(0)} 218 ${x(1)} 214`,
    `C${x(2)} 200 ${x(3)} 180 ${x(3)} 160`,
    `C${x(3)} 142 ${x(2)} 130 ${x(1)} 124`,
    // Crotch
    `L${x(0)} 124`,
    // Left leg (mirror)
    `L${x(-1)} 124`,
    `C${x(-2)} 130 ${x(-3)} 142 ${x(-3)} 160`,
    `C${x(-3)} 180 ${x(-2)} 200 ${x(-1)} 214`,
    `C${x(0)} 218 ${x(-1)} 222 ${x(-4)} 222`,
    `L${x(-11)} 222`,
    `C${x(-16)} 222 ${x(-18)} 218 ${x(-17)} 214`,
    `C${x(-15)} 208 ${x(-14)} 200 ${x(-14)} 190`,
    `C${x(-15)} 168 ${x(-16)} 145 ${x(-14)} 122`,
    // Left hip → torso
    `C${x(-12)} 118 ${x(-11)} 112 ${x(-12)} 104`,
    `C${x(-13)} 88 ${x(-12)} 72 ${x(-10)} 58`,
    // Left arm inner → hand → outer
    `C${x(-14)} 60 ${x(-17)} 66 ${x(-18)} 74`,
    `C${x(-20)} 86 ${x(-21)} 102 ${x(-21)} 119`,
    `C${x(-21)} 123 ${x(-24)} 125 ${x(-27)} 124`,
    `C${x(-32)} 122 ${x(-35)} 116 ${x(-35)} 108`,
    `C${x(-36)} 90 ${x(-34)} 72 ${x(-28)} 58`,
    // Left shoulder → neck → head
    `C${x(-24)} 52 ${x(-14)} 49 ${x(-5)} 48`,
    `L${x(-5)} 44`,
    `C${x(-12)} 42 ${x(-18)} 36 ${x(-18)} 28`,
    `C${x(-18)} 18 ${x(-11)} 10 ${x(0)} 10`,
    'Z',
  ].join(' ')
}

const FRONT_CX = 70
const BACK_CX = 210
const SIL_FRONT = silhouette(FRONT_CX)
const SIL_BACK = silhouette(BACK_CX)

/** Hits hug silhouette; large enough for thumbs. */
const HITS: Hit[] = [
  {
    key: 'shoulders-front',
    id: 'Shoulders',
    label: 'Shoulders',
    d: [
      `M${FRONT_CX - 26} 50`,
      `C${FRONT_CX - 18} 44 ${FRONT_CX - 8} 42 ${FRONT_CX} 42`,
      `C${FRONT_CX + 8} 42 ${FRONT_CX + 18} 44 ${FRONT_CX + 26} 50`,
      `C${FRONT_CX + 22} 58 ${FRONT_CX + 12} 62 ${FRONT_CX} 62`,
      `C${FRONT_CX - 12} 62 ${FRONT_CX - 22} 58 ${FRONT_CX - 26} 50`,
      'Z',
    ].join(' '),
  },
  {
    key: 'chest-front',
    id: 'Chest',
    label: 'Chest',
    d: [
      `M${FRONT_CX - 16} 58`,
      `C${FRONT_CX - 6} 52 ${FRONT_CX + 6} 52 ${FRONT_CX + 16} 58`,
      `C${FRONT_CX + 17} 70 ${FRONT_CX + 15} 82 ${FRONT_CX + 12} 90`,
      `C${FRONT_CX + 6} 94 ${FRONT_CX - 6} 94 ${FRONT_CX - 12} 90`,
      `C${FRONT_CX - 15} 82 ${FRONT_CX - 17} 70 ${FRONT_CX - 16} 58`,
      'Z',
    ].join(' '),
  },
  {
    key: 'arms-front-l',
    id: 'Arms',
    label: 'Arms',
    d: [
      `M${FRONT_CX - 12} 56`,
      `C${FRONT_CX - 20} 60 ${FRONT_CX - 28} 72 ${FRONT_CX - 30} 90`,
      `C${FRONT_CX - 31} 104 ${FRONT_CX - 29} 116 ${FRONT_CX - 26} 122`,
      `L${FRONT_CX - 20} 120`,
      `C${FRONT_CX - 22} 108 ${FRONT_CX - 22} 94 ${FRONT_CX - 20} 80`,
      `C${FRONT_CX - 18} 68 ${FRONT_CX - 14} 60 ${FRONT_CX - 12} 56`,
      'Z',
    ].join(' '),
  },
  {
    key: 'arms-front-r',
    id: 'Arms',
    label: 'Arms',
    d: [
      `M${FRONT_CX + 12} 56`,
      `C${FRONT_CX + 20} 60 ${FRONT_CX + 28} 72 ${FRONT_CX + 30} 90`,
      `C${FRONT_CX + 31} 104 ${FRONT_CX + 29} 116 ${FRONT_CX + 26} 122`,
      `L${FRONT_CX + 20} 120`,
      `C${FRONT_CX + 22} 108 ${FRONT_CX + 22} 94 ${FRONT_CX + 20} 80`,
      `C${FRONT_CX + 18} 68 ${FRONT_CX + 14} 60 ${FRONT_CX + 12} 56`,
      'Z',
    ].join(' '),
  },
  {
    key: 'core-front',
    id: 'Core',
    label: 'Core',
    d: [
      `M${FRONT_CX - 11} 90`,
      `L${FRONT_CX + 11} 90`,
      `C${FRONT_CX + 12} 102 ${FRONT_CX + 11} 114 ${FRONT_CX + 9} 122`,
      `C${FRONT_CX + 5} 126 ${FRONT_CX - 5} 126 ${FRONT_CX - 9} 122`,
      `C${FRONT_CX - 11} 114 ${FRONT_CX - 12} 102 ${FRONT_CX - 11} 90`,
      'Z',
    ].join(' '),
  },
  {
    key: 'legs-front-l',
    id: 'Legs',
    label: 'Legs',
    d: [
      `M${FRONT_CX - 13} 124`,
      `C${FRONT_CX - 15} 145 ${FRONT_CX - 14} 168 ${FRONT_CX - 13} 190`,
      `C${FRONT_CX - 13} 202 ${FRONT_CX - 14} 212 ${FRONT_CX - 12} 220`,
      `L${FRONT_CX - 3} 220`,
      `C${FRONT_CX - 2} 205 ${FRONT_CX - 2} 175 ${FRONT_CX - 2} 150`,
      `C${FRONT_CX - 2} 135 ${FRONT_CX - 3} 128 ${FRONT_CX - 1} 124`,
      'Z',
    ].join(' '),
  },
  {
    key: 'legs-front-r',
    id: 'Legs',
    label: 'Legs',
    d: [
      `M${FRONT_CX + 13} 124`,
      `C${FRONT_CX + 15} 145 ${FRONT_CX + 14} 168 ${FRONT_CX + 13} 190`,
      `C${FRONT_CX + 13} 202 ${FRONT_CX + 14} 212 ${FRONT_CX + 12} 220`,
      `L${FRONT_CX + 3} 220`,
      `C${FRONT_CX + 2} 205 ${FRONT_CX + 2} 175 ${FRONT_CX + 2} 150`,
      `C${FRONT_CX + 2} 135 ${FRONT_CX + 3} 128 ${FRONT_CX + 1} 124`,
      'Z',
    ].join(' '),
  },

  {
    key: 'shoulders-back',
    id: 'Shoulders',
    label: 'Shoulders',
    d: [
      `M${BACK_CX - 26} 50`,
      `C${BACK_CX - 18} 44 ${BACK_CX - 8} 42 ${BACK_CX} 42`,
      `C${BACK_CX + 8} 42 ${BACK_CX + 18} 44 ${BACK_CX + 26} 50`,
      `C${BACK_CX + 22} 58 ${BACK_CX + 12} 62 ${BACK_CX} 62`,
      `C${BACK_CX - 12} 62 ${BACK_CX - 22} 58 ${BACK_CX - 26} 50`,
      'Z',
    ].join(' '),
  },
  {
    key: 'back-torso',
    id: 'Back',
    label: 'Back',
    d: [
      `M${BACK_CX - 16} 58`,
      `C${BACK_CX - 6} 52 ${BACK_CX + 6} 52 ${BACK_CX + 16} 58`,
      `C${BACK_CX + 17} 78 ${BACK_CX + 14} 100 ${BACK_CX + 10} 116`,
      `C${BACK_CX + 5} 122 ${BACK_CX - 5} 122 ${BACK_CX - 10} 116`,
      `C${BACK_CX - 14} 100 ${BACK_CX - 17} 78 ${BACK_CX - 16} 58`,
      'Z',
    ].join(' '),
  },
  {
    key: 'arms-back-l',
    id: 'Arms',
    label: 'Arms',
    d: [
      `M${BACK_CX - 12} 56`,
      `C${BACK_CX - 20} 60 ${BACK_CX - 28} 72 ${BACK_CX - 30} 90`,
      `C${BACK_CX - 31} 104 ${BACK_CX - 29} 116 ${BACK_CX - 26} 122`,
      `L${BACK_CX - 20} 120`,
      `C${BACK_CX - 22} 108 ${BACK_CX - 22} 94 ${BACK_CX - 20} 80`,
      `C${BACK_CX - 18} 68 ${BACK_CX - 14} 60 ${BACK_CX - 12} 56`,
      'Z',
    ].join(' '),
  },
  {
    key: 'arms-back-r',
    id: 'Arms',
    label: 'Arms',
    d: [
      `M${BACK_CX + 12} 56`,
      `C${BACK_CX + 20} 60 ${BACK_CX + 28} 72 ${BACK_CX + 30} 90`,
      `C${BACK_CX + 31} 104 ${BACK_CX + 29} 116 ${BACK_CX + 26} 122`,
      `L${BACK_CX + 20} 120`,
      `C${BACK_CX + 22} 108 ${BACK_CX + 22} 94 ${BACK_CX + 20} 80`,
      `C${BACK_CX + 18} 68 ${BACK_CX + 14} 60 ${BACK_CX + 12} 56`,
      'Z',
    ].join(' '),
  },
  {
    key: 'legs-back-l',
    id: 'Legs',
    label: 'Legs',
    d: [
      `M${BACK_CX - 13} 124`,
      `C${BACK_CX - 15} 145 ${BACK_CX - 14} 168 ${BACK_CX - 13} 190`,
      `C${BACK_CX - 13} 202 ${BACK_CX - 14} 212 ${BACK_CX - 12} 220`,
      `L${BACK_CX - 3} 220`,
      `C${BACK_CX - 2} 205 ${BACK_CX - 2} 175 ${BACK_CX - 2} 150`,
      `C${BACK_CX - 2} 135 ${BACK_CX - 3} 128 ${BACK_CX - 1} 124`,
      'Z',
    ].join(' '),
  },
  {
    key: 'legs-back-r',
    id: 'Legs',
    label: 'Legs',
    d: [
      `M${BACK_CX + 13} 124`,
      `C${BACK_CX + 15} 145 ${BACK_CX + 14} 168 ${BACK_CX + 13} 190`,
      `C${BACK_CX + 13} 202 ${BACK_CX + 14} 212 ${BACK_CX + 12} 220`,
      `L${BACK_CX + 3} 220`,
      `C${BACK_CX + 2} 205 ${BACK_CX + 2} 175 ${BACK_CX + 2} 150`,
      `C${BACK_CX + 2} 135 ${BACK_CX + 3} 128 ${BACK_CX + 1} 124`,
      'Z',
    ].join(' '),
  },
]

const LEGEND: { id: BodyTag; label: string }[] = [
  { id: 'Shoulders', label: 'Shoulders' },
  { id: 'Chest', label: 'Chest' },
  { id: 'Arms', label: 'Arms' },
  { id: 'Core', label: 'Core' },
  { id: 'Legs', label: 'Legs' },
  { id: 'Back', label: 'Back' },
]

export function BodyMap({ selected, onToggle, available }: Props) {
  const allowed = available ? new Set(available) : null

  return (
    <div className="body-map" role="group" aria-label="Body map filters">
      <svg
        className="body-map-svg"
        viewBox="0 0 280 250"
        width="100%"
        height="auto"
        aria-labelledby="body-map-title"
      >
        <title id="body-map-title">Tap a body region to filter workouts</title>

        <path className="body-map-silhouette" d={SIL_FRONT} />
        <path className="body-map-silhouette" d={SIL_BACK} />

        <path
          className="body-map-guide"
          d={`M${FRONT_CX} 56v62 M${FRONT_CX - 7} 72h14 M${FRONT_CX - 7} 90h14 M${FRONT_CX - 7} 108h14`}
        />
        <path
          className="body-map-guide"
          d={`M${BACK_CX} 56v58 M${BACK_CX - 7} 78h14 M${BACK_CX - 7} 100h14`}
        />

        <text x={FRONT_CX} y="242" className="body-map-caption">
          Front
        </text>
        <text x={BACK_CX} y="242" className="body-map-caption">
          Back
        </text>

        {HITS.map((hit) => {
          if (allowed && !allowed.has(hit.id)) return null
          const on = selected.includes(hit.id)
          return (
            <path
              key={hit.key}
              d={hit.d}
              className={`body-map-region${on ? ' on' : ''}`}
              role="button"
              tabIndex={0}
              aria-label={`Filter ${hit.label}`}
              aria-pressed={on}
              onClick={() => onToggle(hit.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onToggle(hit.id)
                }
              }}
            />
          )
        })}
      </svg>
      <div className="body-map-legend">
        {LEGEND.map((r) => {
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
