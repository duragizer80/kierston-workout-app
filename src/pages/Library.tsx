import { useMemo, useState, type MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { StarRating } from '../components/StarRating'
import {
  getRating,
  isFavorite,
  toggleFavorite,
  type WorkoutRating,
} from '../lib/storage'
import {
  EQUIPMENT_TAGS,
  ERA_SECTIONS,
  cardSubtitle,
  cardTitle,
  equipmentSignature,
  equipmentTags,
  formatCardDate,
  sortByDateDesc,
  workoutEra,
  type EquipmentTag,
} from '../lib/tags'
import { workouts } from '../lib/workouts'
import type { Workout } from '../types'

type SortMode = 'date' | 'rating' | 'name'

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

function matchesEquipment(w: Workout, selected: EquipmentTag[]): boolean {
  if (!selected.length) return true
  const tags = new Set(equipmentTags(w))
  return selected.every((t) => tags.has(t))
}

function sortWorkouts(list: Workout[], mode: SortMode): Workout[] {
  const copy = [...list]
  if (mode === 'date') return copy.sort(sortByDateDesc)
  if (mode === 'name') {
    return copy.sort((a, b) => {
      const sa = (equipmentSignature(a) || cardTitle(a)).toLowerCase()
      const sb = (equipmentSignature(b) || cardTitle(b)).toLowerCase()
      const cmp = sa.localeCompare(sb)
      return cmp || sortByDateDesc(a, b)
    })
  }
  // rating: highest first; unrated last; tie-break by date
  return copy.sort((a, b) => {
    const ra = getRating(a.id)
    const rb = getRating(b.id)
    if (ra !== rb) return rb - ra
    return sortByDateDesc(a, b)
  })
}

export function Library() {
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState<EquipmentTag[]>([])
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [sort, setSort] = useState<SortMode>('date')
  const [tick, setTick] = useState(0)

  const filtered = useMemo(() => {
    void tick
    const needle = q.trim().toLowerCase()
    const base = workouts.filter((w) => {
      if (favoritesOnly && !isFavorite(w.id)) return false
      return matchesSearch(w, needle) && matchesEquipment(w, selected)
    })
    return sortWorkouts(base, sort)
  }, [q, selected, favoritesOnly, sort, tick])

  const byEra = useMemo(() => {
    const map = new Map<string, Workout[]>()
    for (const section of ERA_SECTIONS) map.set(section.id, [])
    for (const w of filtered) {
      const id = workoutEra(w)
      map.get(id)?.push(w)
    }
    // Re-sort within each era (map insertion already filtered-order for date/name;
    // rating sort across eras still preserves era buckets)
    for (const [id, list] of map) {
      map.set(id, sortWorkouts(list, sort))
    }
    return map
  }, [filtered, sort])

  function toggleChip(tag: EquipmentTag) {
    setSelected((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    )
  }

  function onFavorite(e: MouseEvent, id: string) {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(id)
    setTick((n) => n + 1)
  }

  function onRated(_rating: WorkoutRating) {
    setTick((n) => n + 1)
  }

  const hasFilters = selected.length > 0 || favoritesOnly

  return (
    <main>
      <h1 className="page-title">Library</h1>
      <p className="lede">
        By trainer era — tag equipment, rate 1–5, heart favorites, sort how you browse.
      </p>

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
        </div>

        <div className="filters" role="group" aria-label="Quick filters">
          <button
            type="button"
            className={`chip chip-fav${favoritesOnly ? ' on' : ''}`}
            aria-pressed={favoritesOnly}
            onClick={() => setFavoritesOnly((v) => !v)}
          >
            ♥ Favorites
          </button>
          {EQUIPMENT_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              className={`chip${selected.includes(tag) ? ' on' : ''}`}
              aria-pressed={selected.includes(tag)}
              onClick={() => toggleChip(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
        {hasFilters ? (
          <button
            type="button"
            className="clear-filters"
            onClick={() => {
              setSelected([])
              setFavoritesOnly(false)
            }}
          >
            Clear filters
          </button>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <p className="empty">No workouts match.</p>
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
                        <h3>{cardTitle(w)}</h3>
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
                        {cardSubtitle(w)}
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
