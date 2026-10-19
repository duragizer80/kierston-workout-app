import { BODY_TAG_GROUPS, type BodyTag } from '../lib/tags'

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
 * Fitbod-inspired body map (original SVG — not Fitbod assets).
 *
 * Research notes (Fitbod recovery avatar / pick-muscle UI):
 * - Front + back anatomical figure with discrete filled muscle patches
 * - Muscles tile the silhouette (solid fills, not big region blobs)
 * - Taps expose: chest, shoulders, biceps, triceps, abs/core, upper back,
 *   lower back, quads, hamstrings, glutes, calves (Fitbod also has traps etc.)
 * - Idle = muted fill; active/fatigued = saturated fill (we use gold select)
 *
 * Layout: front @ cx=70, back @ cx=210. ViewBox 0 0 280 250.
 */

function silhouette(cx: number): string {
  const x = (dx: number) => cx + dx
  return [
    `M${x(0)} 8`,
    `C${x(12)} 8 ${x(19)} 17 ${x(19)} 27`,
    `C${x(19)} 36 ${x(13)} 42 ${x(6)} 44`,
    `L${x(6)} 47`,
    `C${x(16)} 48 ${x(26)} 51 ${x(30)} 58`,
    `C${x(36)} 72 ${x(38)} 92 ${x(37)} 110`,
    `C${x(37)} 118 ${x(33)} 124 ${x(28)} 125`,
    `C${x(25)} 126 ${x(22)} 124 ${x(22)} 120`,
    `C${x(22)} 102 ${x(21)} 84 ${x(19)} 72`,
    `C${x(17)} 64 ${x(14)} 58 ${x(10)} 56`,
    `C${x(13)} 74 ${x(14)} 92 ${x(13)} 108`,
    `C${x(12)} 116 ${x(13)} 122 ${x(15)} 126`,
    `C${x(17)} 150 ${x(16)} 174 ${x(15)} 194`,
    `C${x(15)} 204 ${x(16)} 212 ${x(18)} 216`,
    `C${x(19)} 220 ${x(17)} 224 ${x(12)} 224`,
    `L${x(4)} 224`,
    `C${x(1)} 224 ${x(0)} 220 ${x(1)} 216`,
    `C${x(2)} 200 ${x(3)} 178 ${x(3)} 158`,
    `C${x(3)} 140 ${x(2)} 128 ${x(1)} 126`,
    `L${x(0)} 126`,
    `L${x(-1)} 126`,
    `C${x(-2)} 128 ${x(-3)} 140 ${x(-3)} 158`,
    `C${x(-3)} 178 ${x(-2)} 200 ${x(-1)} 216`,
    `C${x(0)} 220 ${x(-1)} 224 ${x(-4)} 224`,
    `L${x(-12)} 224`,
    `C${x(-17)} 224 ${x(-19)} 220 ${x(-18)} 216`,
    `C${x(-16)} 212 ${x(-15)} 204 ${x(-15)} 194`,
    `C${x(-16)} 174 ${x(-17)} 150 ${x(-15)} 126`,
    `C${x(-13)} 122 ${x(-12)} 116 ${x(-13)} 108`,
    `C${x(-14)} 92 ${x(-13)} 74 ${x(-10)} 56`,
    `C${x(-14)} 58 ${x(-17)} 64 ${x(-19)} 72`,
    `C${x(-21)} 84 ${x(-22)} 102 ${x(-22)} 120`,
    `C${x(-22)} 124 ${x(-25)} 126 ${x(-28)} 125`,
    `C${x(-33)} 124 ${x(-37)} 118 ${x(-37)} 110`,
    `C${x(-38)} 92 ${x(-36)} 72 ${x(-30)} 58`,
    `C${x(-26)} 51 ${x(-16)} 48 ${x(-6)} 47`,
    `L${x(-6)} 44`,
    `C${x(-13)} 42 ${x(-19)} 36 ${x(-19)} 27`,
    `C${x(-19)} 17 ${x(-12)} 8 ${x(0)} 8`,
    'Z',
  ].join(' ')
}

const F = 70
const B = 210
const SIL_FRONT = silhouette(F)
const SIL_BACK = silhouette(B)

/** side: -1 viewer-left, +1 viewer-right */
function pec(cx: number, side: number): string {
  const s = side
  return [
    `M${cx + s * 1} 54`,
    `C${cx + s * 8} 50 ${cx + s * 16} 52 ${cx + s * 18} 60`,
    `C${cx + s * 19} 70 ${cx + s * 17} 80 ${cx + s * 12} 86`,
    `C${cx + s * 7} 90 ${cx + s * 2} 88 ${cx + s * 1} 82`,
    `C${cx + s * 0} 72 ${cx + s * 0} 60 ${cx + s * 1} 54`,
    'Z',
  ].join(' ')
}

function deltFront(cx: number, side: number): string {
  const s = side
  return [
    `M${cx + s * 8} 46`,
    `C${cx + s * 16} 44 ${cx + s * 24} 48 ${cx + s * 28} 56`,
    `C${cx + s * 26} 64 ${cx + s * 18} 66 ${cx + s * 11} 62`,
    `C${cx + s * 8} 56 ${cx + s * 7} 50 ${cx + s * 8} 46`,
    'Z',
  ].join(' ')
}

function deltBack(cx: number, side: number): string {
  const s = side
  return [
    `M${cx + s * 7} 46`,
    `C${cx + s * 16} 44 ${cx + s * 24} 48 ${cx + s * 28} 56`,
    `C${cx + s * 24} 64 ${cx + s * 16} 66 ${cx + s * 9} 60`,
    `C${cx + s * 6} 54 ${cx + s * 6} 48 ${cx + s * 7} 46`,
    'Z',
  ].join(' ')
}

function biceps(cx: number, side: number): string {
  const s = side
  return [
    `M${cx + s * 12} 58`,
    `C${cx + s * 18} 60 ${cx + s * 24} 68 ${cx + s * 26} 80`,
    `C${cx + s * 27} 90 ${cx + s * 25} 98 ${cx + s * 22} 102`,
    `C${cx + s * 18} 104 ${cx + s * 15} 98 ${cx + s * 15} 90`,
    `C${cx + s * 15} 78 ${cx + s * 14} 66 ${cx + s * 12} 58`,
    'Z',
  ].join(' ')
}

function triceps(cx: number, side: number): string {
  const s = side
  return [
    `M${cx + s * 13} 58`,
    `C${cx + s * 20} 62 ${cx + s * 28} 74 ${cx + s * 30} 90`,
    `C${cx + s * 31} 102 ${cx + s * 28} 112 ${cx + s * 24} 116`,
    `C${cx + s * 20} 114 ${cx + s * 17} 106 ${cx + s * 17} 96`,
    `C${cx + s * 17} 82 ${cx + s * 15} 68 ${cx + s * 13} 58`,
    'Z',
  ].join(' ')
}

function quad(cx: number, side: number): string {
  const s = side
  return [
    `M${cx + s * 2} 126`,
    `C${cx + s * 8} 128 ${cx + s * 14} 134 ${cx + s * 15} 148`,
    `C${cx + s * 16} 160 ${cx + s * 15} 172 ${cx + s * 13} 180`,
    `C${cx + s * 10} 182 ${cx + s * 5} 180 ${cx + s * 3} 172`,
    `C${cx + s * 2} 156 ${cx + s * 1} 138 ${cx + s * 2} 126`,
    'Z',
  ].join(' ')
}

function ham(cx: number, side: number): string {
  const s = side
  return [
    `M${cx + s * 3} 150`,
    `C${cx + s * 9} 152 ${cx + s * 14} 160 ${cx + s * 15} 172`,
    `C${cx + s * 15} 182 ${cx + s * 14} 190 ${cx + s * 12} 194`,
    `C${cx + s * 8} 194 ${cx + s * 4} 190 ${cx + s * 3} 182`,
    `C${cx + s * 2} 168 ${cx + s * 2} 156 ${cx + s * 3} 150`,
    'Z',
  ].join(' ')
}

function calfF(cx: number, side: number): string {
  const s = side
  return [
    `M${cx + s * 4} 182`,
    `C${cx + s * 10} 184 ${cx + s * 13} 194 ${cx + s * 13} 204`,
    `C${cx + s * 13} 214 ${cx + s * 11} 220 ${cx + s * 8} 222`,
    `C${cx + s * 5} 222 ${cx + s * 3} 216 ${cx + s * 3} 208`,
    `C${cx + s * 3} 196 ${cx + s * 3} 186 ${cx + s * 4} 182`,
    'Z',
  ].join(' ')
}

function calfB(cx: number, side: number): string {
  const s = side
  return [
    `M${cx + s * 4} 196`,
    `C${cx + s * 11} 198 ${cx + s * 14} 206 ${cx + s * 14} 214`,
    `C${cx + s * 14} 220 ${cx + s * 11} 222 ${cx + s * 7} 222`,
    `C${cx + s * 4} 222 ${cx + s * 3} 216 ${cx + s * 3} 210`,
    `C${cx + s * 3} 202 ${cx + s * 3} 198 ${cx + s * 4} 196`,
    'Z',
  ].join(' ')
}

function glute(cx: number, side: number): string {
  const s = side
  return [
    `M${cx + s * 1} 122`,
    `C${cx + s * 8} 118 ${cx + s * 14} 122 ${cx + s * 15} 132`,
    `C${cx + s * 15} 142 ${cx + s * 12} 148 ${cx + s * 6} 148`,
    `C${cx + s * 2} 148 ${cx + s * 0} 140 ${cx + s * 1} 132`,
    `C${cx + s * 1} 126 ${cx + s * 1} 122 ${cx + s * 1} 122`,
    'Z',
  ].join(' ')
}

const HITS: Hit[] = [
  // —— Front (Fitbod-style tiling) ——
  { key: 'delt-f-l', id: 'Shoulders', label: 'Shoulders', d: deltFront(F, -1) },
  { key: 'delt-f-r', id: 'Shoulders', label: 'Shoulders', d: deltFront(F, 1) },
  { key: 'pec-l', id: 'Chest', label: 'Chest', d: pec(F, -1) },
  { key: 'pec-r', id: 'Chest', label: 'Chest', d: pec(F, 1) },
  { key: 'bi-l', id: 'Biceps', label: 'Biceps', d: biceps(F, -1) },
  { key: 'bi-r', id: 'Biceps', label: 'Biceps', d: biceps(F, 1) },
  {
    key: 'abs',
    id: 'Core',
    label: 'Core',
    d: [
      `M${F - 9} 88`,
      `L${F + 9} 88`,
      `C${F + 10} 102 ${F + 9} 114 ${F + 7} 122`,
      `C${F + 3} 126 ${F - 3} 126 ${F - 7} 122`,
      `C${F - 9} 114 ${F - 10} 102 ${F - 9} 88`,
      'Z',
    ].join(' '),
  },
  { key: 'quad-l', id: 'Quads', label: 'Quads', d: quad(F, -1) },
  { key: 'quad-r', id: 'Quads', label: 'Quads', d: quad(F, 1) },
  { key: 'calf-f-l', id: 'Calves', label: 'Calves', d: calfF(F, -1) },
  { key: 'calf-f-r', id: 'Calves', label: 'Calves', d: calfF(F, 1) },

  // —— Back ——
  { key: 'delt-b-l', id: 'Shoulders', label: 'Shoulders', d: deltBack(B, -1) },
  { key: 'delt-b-r', id: 'Shoulders', label: 'Shoulders', d: deltBack(B, 1) },
  {
    key: 'upper-back',
    id: 'Upper back',
    label: 'Upper back',
    d: [
      // V-taper lats + mid-back (one tap group, Fitbod “upper back”)
      `M${B - 16} 52`,
      `C${B - 6} 46 ${B + 6} 46 ${B + 16} 52`,
      `C${B + 18} 68 ${B + 16} 84 ${B + 12} 96`,
      `C${B + 6} 102 ${B - 6} 102 ${B - 12} 96`,
      `C${B - 16} 84 ${B - 18} 68 ${B - 16} 52`,
      'Z',
    ].join(' '),
  },
  {
    key: 'lower-back',
    id: 'Lower back',
    label: 'Lower back',
    d: [
      `M${B - 9} 100`,
      `L${B + 9} 100`,
      `C${B + 9} 110 ${B + 7} 118 ${B + 5} 122`,
      `C${B + 2} 126 ${B - 2} 126 ${B - 5} 122`,
      `C${B - 7} 118 ${B - 9} 110 ${B - 9} 100`,
      'Z',
    ].join(' '),
  },
  { key: 'tri-l', id: 'Triceps', label: 'Triceps', d: triceps(B, -1) },
  { key: 'tri-r', id: 'Triceps', label: 'Triceps', d: triceps(B, 1) },
  { key: 'glute-l', id: 'Glutes', label: 'Glutes', d: glute(B, -1) },
  { key: 'glute-r', id: 'Glutes', label: 'Glutes', d: glute(B, 1) },
  { key: 'ham-l', id: 'Hamstrings', label: 'Hamstrings', d: ham(B, -1) },
  { key: 'ham-r', id: 'Hamstrings', label: 'Hamstrings', d: ham(B, 1) },
  { key: 'calf-b-l', id: 'Calves', label: 'Calves', d: calfB(B, -1) },
  { key: 'calf-b-r', id: 'Calves', label: 'Calves', d: calfB(B, 1) },
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
        <title id="body-map-title">Tap a muscle to filter workouts</title>

        <path className="body-map-silhouette" d={SIL_FRONT} />
        <path className="body-map-silhouette" d={SIL_BACK} />

        {/* Abs segmentation + midline — Fitbod-like muscle definition cues */}
        <path
          className="body-map-guide"
          d={`M${F} 56v66 M${F - 7} 100h14 M${F - 7} 112h14 M${B} 54v46`}
        />

        <text x={F} y="242" className="body-map-caption">
          Front
        </text>
        <text x={B} y="242" className="body-map-caption">
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
        {BODY_TAG_GROUPS.map((group) => {
          const chips = group.tags.filter((t) => !allowed || allowed.has(t))
          if (!chips.length) return null
          return (
            <div key={group.label} className="body-map-legend-group">
              <span className="body-map-legend-label">{group.label}</span>
              <div className="body-map-legend-chips">
                {chips.map((id) => {
                  const on = selected.includes(id)
                  return (
                    <button
                      key={id}
                      type="button"
                      className={`body-map-chip${on ? ' on' : ''}`}
                      aria-pressed={on}
                      onClick={() => onToggle(id)}
                    >
                      {id}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
      <p className="body-map-hint">
        Tap muscles — multi-select OK · same filters as body chips
      </p>
    </div>
  )
}
