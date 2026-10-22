import { useEffect, useMemo, useState, type MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { BodyMap } from '../components/BodyMap'
import { StarRating } from '../components/StarRating'
import {
  getExcludedBodyTags,
  getRating,
  isFavorite,
  setExcludedBodyTags,
  toggleFavorite,
  type WorkoutRating,
} from '../lib/storage'
import {
  displaySubtitle,
  displayTitle,
  isRoutineId,
  listRoutineWorkouts,
} from '../lib/routines'
import {
  BODY_TAGS,
  EQUIPMENT_TAGS,
  ERA_SECTIONS,
  bodyChipLabel,
  bodyTags,
  buildTagCounts,
  equipmentSignature,
  equipmentTags,
  formatCardDate,
  sortByDateDesc,
  workoutEra,
  type BodyTag,
  type EquipmentTag,
} from '../lib/tags'
import { workouts } from '../lib/workouts'
import type { Workout } from '../types'

type SortMode = 'date' | 'rating' | 'name'
type BodyMode = 'include' | 'exclude'

function matchesSearch(w: Workout, needle: string): boolean {
  if (!needle) return true
  const hay = [
    w.name,
    w.notes ?? '',
    ...w.exercises.map((e) => `${e.name} ${e.load_notes ?? ''}`),
  ]
    .join(' ')
    .toLowerCase()
  return hay.includes(needle)
}

function hasAll<T extends string>(have: T[], need: T[]): boolean {
  if (!need.length) return true
  const set = new Set(have)
  return need.every((t) => set.has(t))
}

function hasNone<T extends string>(have: T[], banned: T[]): boolean {
  if (!banned.length) return true
  const set = new Set(have)
  return banned.every((t) => !set.has(t))
}

function sortWorkouts(list: Workout[], mode: SortMode): Workout[] {
  const copy = [...list]
  if (mode === 'date') return copy.sort(sortByDateDesc)
  if (mode === 'name') {
    return copy.sort((a, b) => {
      const sa = (
        isRoutineId(a.id)
          ? a.name
          : equipmentSignature(a) || displayTitle(a)
      ).toLowerCase()
      const sb = (
        isRoutineId(b.id)
          ? b.name
          : equipmentSignature(b) || displayTitle(b)
      ).toLowerCase()
      const cmp = sa.localeCompare(sb)
      return cmp || sortByDateDesc(a, b)
    })
  }
  return copy.sort((a, b) => {
    const ra = getRating(a.id)
    const rb = getRating(b.id)
    if (ra !== rb) return rb - ra
    return sortByDateDesc(a, b)
  })
}

function toggleIn<T>(prev: T[], tag: T): T[] {
  return prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
}

export function Library() {
  const [q, setQ] = useState('')
  const [bodySelected, setBodySelected] = useState<BodyTag[]>([])
  const [bodyExcluded, setBodyExcluded] = useState<BodyTag[]>(() =>
    getExcludedBodyTags(),
  )
  const [bodyMode, setBodyMode] = useState<BodyMode>('include')
  const [equipSelected, setEquipSelected] = useState<EquipmentTag[]>([])
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [sort, setSort] = useState<SortMode>('date')
  const [tick, setTick] = useState(0)

  useEffect(() => {
    setExcludedBodyTags(bodyExcluded)
  }, [bodyExcluded])

  const libraryCounts = useMemo(() => buildTagCounts(workouts), [])

  const bodyChips = useMemo(
    () => BODY_TAGS.filter((t) => (libraryCounts.body[t] ?? 0) > 0),
    [libraryCounts],
  )
  const equipChips = useMemo(
    () => EQUIPMENT_TAGS.filter((t) => (libraryCounts.equipment[t] ?? 0) > 0),
    [libraryCounts],
  )

  const savedRoutines = useMemo(() => {
    void tick
    return listRoutineWorkouts()
  }, [tick])

  const filtered = useMemo(() => {
    void tick
    const needle = q.trim().toLowerCase()
    const base = workouts.filter((w) => {
      if (favoritesOnly && !isFavorite(w.id)) return false
      if (!matchesSearch(w, needle)) return false
      if (!hasAll(bodyTags(w), bodySelected)) return false
      if (!hasNone(bodyTags(w), bodyExcluded)) return false
      if (!hasAll(equipmentTags(w), equipSelected)) return false
      return true
    })
    return sortWorkouts(base, sort)
  }, [q, bodySelected, bodyExcluded, equipSelected, favoritesOnly, sort, tick])

  const byEra = useMemo(() => {
    const map = new Map<string, Workout[]>()
    for (const section of ERA_SECTIONS) map.set(section.id, [])
    for (const w of filtered) {
      map.get(workoutEra(w))?.push(w)
    }
    for (const [id, list] of map) {
      map.set(id, sortWorkouts(list, sort))
    }
    return map
  }, [filtered, sort])

  function onFavorite(e: MouseEvent, id: string) {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(id)
    setTick((n) => n + 1)
  }

  function onRated(_rating: WorkoutRating) {
    setTick((n) => n + 1)
  }

  function onBodyToggle(tag: BodyTag) {
    if (bodyMode === 'exclude') {
      setBodyExcluded((p) => toggleIn(p, tag))
      // Drop from include if excluding
      setBodySelected((p) => p.filter((t) => t !== tag))
    } else {
      setBodySelected((p) => toggleIn(p, tag))
      // Drop from exclude if including
      setBodyExcluded((p) => p.filter((t) => t !== tag))
    }
  }

  const hasIncludeFilters =
    bodySelected.length > 0 || equipSelected.length > 0 || favoritesOnly
  const hasExcludes = bodyExcluded.length > 0
  const hasFilters = hasIncludeFilters || hasExcludes

  return (
    <main>
      <h1 className="page-title">Library</h1>
      <p className="lede">
        Tap the body map or chips to narrow — exclude strained muscles, rate,
        heart favorites.
      </p>

      <div className="library-actions">
        <Link className="btn btn-secondary" to="/routine/new">
          + New routine
        </Link>
      </div>

      {savedRoutines.length > 0 ? (
        <section className="era-section routines-section">
          <header className="era-header">
            <h2>Your routines</h2>
            <span className="era-count">{savedRoutines.length}</span>
          </header>
          <p className="era-blurb">Named by you · saved on this device</p>
          <div className="workout-list">
            {savedRoutines.map((w, i) => {
              const fav = isFavorite(w.id)
              const rating = getRating(w.id)
              return (
                <Link
                  key={w.id}
                  to={`/workout/${w.id}`}
                  className="workout-row"
                  style={{ animationDelay: `${Math.min(i, 8) * 30}ms` }}
                >
                  <div className="row-top">
                    <h3>{displayTitle(w)}</h3>
                    <button
                      type="button"
                      className={`fav-btn${fav ? ' on' : ''}`}
                      aria-label={fav ? 'Remove favorite' : 'Add favorite'}
                      aria-pressed={fav}
                      onClick={(e) => onFavorite(e, w.id)}
                    >
                      {fav ? '♥' : '♡'}
                    </button>
                  </div>
                  <p>
                    {displaySubtitle(w)}
                    {rating ? ` · ${rating}/5` : ''}
                  </p>
                </Link>
              )
            })}
          </div>
        </section>
      ) : null}

      <div className="search-row">
        <input
          type="search"
          placeholder="Search exercise name…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search workouts by exercise"
        />

        <div className="sort-row" role="group" aria-label="Sort workouts">
          <span className="sort-label">Sort</span>
          {(
            [
              ['date', 'Date'],
              ['rating', 'Rating'],
              ['name', 'Name'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={`chip${sort === id ? ' on' : ''}`}
              aria-pressed={sort === id}
              onClick={() => setSort(id)}
            >
              {label}
            </button>
          ))}
          <button
            type="button"
            className={`chip chip-fav${favoritesOnly ? ' on' : ''}`}
            aria-pressed={favoritesOnly}
            onClick={() => setFavoritesOnly((v) => !v)}
          >
            ♥ Favorites
          </button>
        </div>

        <div className="filter-block">
          <div className="filter-heading-row">
            <div className="filter-heading">Body map</div>
            <div
              className="mode-toggle"
              role="group"
              aria-label="Include or exclude muscles"
            >
              <button
                type="button"
                className={`mode-btn${bodyMode === 'include' ? ' on' : ''}`}
                aria-pressed={bodyMode === 'include'}
                onClick={() => setBodyMode('include')}
              >
                Include
              </button>
              <button
                type="button"
                className={`mode-btn mode-btn-exclude${bodyMode === 'exclude' ? ' on' : ''}`}
                aria-pressed={bodyMode === 'exclude'}
                onClick={() => setBodyMode('exclude')}
              >
                Exclude
              </button>
            </div>
          </div>
          <BodyMap
            selected={bodySelected}
            excluded={bodyExcluded}
            mode={bodyMode}
            onToggle={onBodyToggle}
            available={bodyChips.filter((t) => t !== 'Cardio')}
          />
        </div>

        {hasExcludes ? (
          <div className="exclude-banner" role="status">
            <div className="exclude-banner-text">
              <span className="exclude-label">Excluding:</span>{' '}
              {bodyExcluded.map(bodyChipLabel).join(', ')}
            </div>
            <button
              type="button"
              className="exclude-clear"
              onClick={() => setBodyExcluded([])}
            >
              Clear excludes
            </button>
          </div>
        ) : null}

        <div className="filter-block">
          <div className="filter-heading">
            Body · {bodyMode === 'include' ? 'include' : 'exclude'}
          </div>
          <div
            className="filters filters-lg"
            role="group"
            aria-label={
              bodyMode === 'include'
                ? 'Body part include filters'
                : 'Body part exclude filters'
            }
          >
            {bodyChips.map((tag) => {
              const count = libraryCounts.body[tag] ?? 0
              const included = bodySelected.includes(tag)
              const excluded = bodyExcluded.includes(tag)
              const on = bodyMode === 'exclude' ? excluded : included
              const cls = [
                'chip',
                'chip-lg',
                on ? (bodyMode === 'exclude' ? 'excluded' : 'on') : '',
                bodyMode === 'include' && excluded ? 'excluded soft' : '',
              ]
                .filter(Boolean)
                .join(' ')
              return (
                <button
                  key={tag}
                  type="button"
                  className={cls}
                  aria-pressed={on}
                  onClick={() => onBodyToggle(tag)}
                >
                  {bodyChipLabel(tag)}
                  <span className="chip-count">{count}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="filter-block">
          <div className="filter-heading">Equipment</div>
          <div className="filters filters-lg" role="group" aria-label="Equipment filters">
            {equipChips.map((tag) => {
              const count = libraryCounts.equipment[tag] ?? 0
              const on = equipSelected.includes(tag)
              return (
                <button
                  key={tag}
                  type="button"
                  className={`chip chip-lg${on ? ' on' : ''}`}
                  aria-pressed={on}
                  onClick={() => setEquipSelected((p) => toggleIn(p, tag))}
                >
                  {tag}
                  <span className="chip-count">{count}</span>
                </button>
              )
            })}
          </div>
        </div>

        {hasFilters ? (
          <button
            type="button"
            className="clear-filters"
            onClick={() => {
              setBodySelected([])
              setBodyExcluded([])
              setEquipSelected([])
              setFavoritesOnly(false)
            }}
          >
            Clear filters
          </button>
        ) : null}
      </div>

      <p className="match-count" aria-live="polite">
        {filtered.length} match{filtered.length === 1 ? '' : 'es'}
        {hasIncludeFilters ? ' · filters on' : ''}
        {hasExcludes ? ` · excluding ${bodyExcluded.length}` : ''}
      </p>

      {filtered.length === 0 ? (
        <p className="empty">No workouts match — clear a chip, exclude, or search.</p>
      ) : (
        ERA_SECTIONS.map((section) => {
          const list = byEra.get(section.id) ?? []
          if (!list.length) return null
          return (
            <section key={section.id} className="era-section">
              <header className="era-header">
                <h2>{section.label}</h2>
                <span className="era-count">{list.length}</span>
              </header>
              <p className="era-blurb">{section.blurb}</p>
              <div className="workout-list">
                {list.map((w, i) => {
                  const fav = isFavorite(w.id)
                  const rating = getRating(w.id)
                  return (
                    <Link
                      key={w.id}
                      to={`/workout/${w.id}`}
                      className="workout-row"
                      style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}
                    >
                      <div className="row-top">
                        <h3>{displayTitle(w)}</h3>
                        <button
                          type="button"
                          className={`fav-btn${fav ? ' on' : ''}`}
                          aria-label={fav ? 'Remove favorite' : 'Add favorite'}
                          aria-pressed={fav}
                          onClick={(e) => onFavorite(e, w.id)}
                        >
                          {fav ? '♥' : '♡'}
                        </button>
                      </div>
                      <p>
                        {displaySubtitle(w)}
                        {rating ? ` · ${rating}/5` : ''}
                      </p>
                      <div className="row-meta">
                        <StarRating
                          workoutId={w.id}
                          value={rating}
                          onChange={onRated}
                          size="sm"
                        />
                        <span className="row-date-hint">{formatCardDate(w)}</span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          )
        })
      )}
    </main>
  )
}
