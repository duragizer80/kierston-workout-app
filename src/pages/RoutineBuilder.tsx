import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { exerciseCatalogue, type CatalogueExercise } from '../lib/catalogue'
import { blankRoutineExercise } from '../lib/routines'
import {
  getRoutine,
  newRoutineId,
  saveRoutine,
} from '../lib/storage'
import {
  BODY_TAGS,
  EQUIPMENT_TAGS,
  bodyChipLabel,
  type BodyTag,
  type EquipmentTag,
} from '../lib/tags'
import type { RoutineExercise, SavedRoutine } from '../types'

function toggleIn<T>(prev: T[], tag: T): T[] {
  return prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
}

function hasAll<T extends string>(have: T[], need: T[]): boolean {
  if (!need.length) return true
  const set = new Set(have)
  return need.every((t) => set.has(t))
}

function fromCatalogue(ex: CatalogueExercise): RoutineExercise {
  return blankRoutineExercise(ex.name, {
    sets: ex.commonSets,
    reps: ex.commonReps,
    rest: ex.commonRest,
    load_notes: ex.commonLoadNotes,
  })
}

export function RoutineBuilder() {
  const { id } = useParams()
  const navigate = useNavigate()
  const editing = id ? getRoutine(id) : undefined

  const [name, setName] = useState(editing?.name ?? '')
  const [picked, setPicked] = useState<RoutineExercise[]>(
    () => editing?.exercises.map((e) => ({ ...e })) ?? [],
  )
  const [q, setQ] = useState('')
  const [bodyFilter, setBodyFilter] = useState<BodyTag[]>([])
  const [equipFilter, setEquipFilter] = useState<EquipmentTag[]>([])
  const [error, setError] = useState('')

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return exerciseCatalogue.filter((ex) => {
      if (picked.some((p) => p.name === ex.name)) return false
      if (needle) {
        const hay = `${ex.name} ${ex.standardName ?? ''}`.toLowerCase()
        if (!hay.includes(needle)) return false
      }
      if (!hasAll(ex.body, bodyFilter)) return false
      if (!hasAll(ex.equipment, equipFilter)) return false
      return true
    })
  }, [q, bodyFilter, equipFilter, picked])

  const bodyChips = useMemo(
    () =>
      BODY_TAGS.filter((t) =>
        exerciseCatalogue.some((ex) => ex.body.includes(t)),
      ),
    [],
  )
  const equipChips = useMemo(
    () =>
      EQUIPMENT_TAGS.filter((t) =>
        exerciseCatalogue.some((ex) => ex.equipment.includes(t)),
      ),
    [],
  )

  function addExercise(ex: CatalogueExercise) {
    setPicked((prev) => [...prev, fromCatalogue(ex)])
    setError('')
  }

  function removeAt(index: number) {
    setPicked((prev) => prev.filter((_, i) => i !== index))
  }

  function move(index: number, dir: -1 | 1) {
    setPicked((prev) => {
      const next = [...prev]
      const j = index + dir
      if (j < 0 || j >= next.length) return prev
      ;[next[index], next[j]] = [next[j], next[index]]
      return next
    })
  }

  function updateAt(index: number, patch: Partial<RoutineExercise>) {
    setPicked((prev) =>
      prev.map((e, i) => (i === index ? { ...e, ...patch } : e)),
    )
  }

  function onSave() {
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Give this routine a name.')
      return
    }
    if (!picked.length) {
      setError('Add at least one exercise.')
      return
    }
    const now = new Date().toISOString()
    const routine: SavedRoutine = {
      id: editing?.id ?? newRoutineId(),
      name: trimmed,
      createdAt: editing?.createdAt ?? now,
      updatedAt: now,
      exercises: picked,
    }
    saveRoutine(routine)
    navigate(`/workout/${routine.id}`)
  }

  return (
    <main>
      <Link to={editing ? `/workout/${editing.id}` : '/library'} className="back-link">
        ← {editing ? 'Routine' : 'Library'}
      </Link>
      <h1 className="page-title">{editing ? 'Edit routine' : 'New routine'}</h1>
      <p className="lede">
        Pick exercises from the library catalogue, set sets/reps, name it, save
        on this device.
      </p>

      <label className="field">
        <span className="field-label">Routine name</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Upper no glutes"
          aria-label="Routine name"
        />
      </label>

      <section className="builder-picked">
        <div className="filter-heading">
          Selected · {picked.length}
        </div>
        {picked.length === 0 ? (
          <p className="empty soft">No exercises yet — search and add below.</p>
        ) : (
          <ul className="builder-list">
            {picked.map((ex, i) => (
              <li key={`${ex.name}-${i}`} className="builder-item">
                <div className="builder-item-top">
                  <strong>{ex.name}</strong>
                  <div className="builder-move">
                    <button
                      type="button"
                      className="icon-btn"
                      aria-label="Move up"
                      disabled={i === 0}
                      onClick={() => move(i, -1)}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="icon-btn"
                      aria-label="Move down"
                      disabled={i === picked.length - 1}
                      onClick={() => move(i, 1)}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      className="icon-btn danger"
                      aria-label="Remove"
                      onClick={() => removeAt(i)}
                    >
                      ×
                    </button>
                  </div>
                </div>
                <div className="builder-rx">
                  <label>
                    Sets
                    <input
                      inputMode="numeric"
                      value={ex.sets ?? ''}
                      onChange={(e) =>
                        updateAt(i, { sets: e.target.value || null })
                      }
                    />
                  </label>
                  <label>
                    Reps
                    <input
                      value={ex.reps ?? ''}
                      onChange={(e) =>
                        updateAt(i, { reps: e.target.value || null })
                      }
                    />
                  </label>
                  <label>
                    Rest
                    <input
                      value={ex.rest ?? ''}
                      onChange={(e) =>
                        updateAt(i, { rest: e.target.value || null })
                      }
                      placeholder="90 sec"
                    />
                  </label>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="builder-catalogue">
        <div className="filter-heading">Add exercises</div>
        <input
          type="search"
          className="builder-search"
          placeholder="Search catalogue…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search exercise catalogue"
        />

        <div className="filters filters-lg" role="group" aria-label="Muscle filter">
          {bodyChips.map((tag) => {
            const on = bodyFilter.includes(tag)
            return (
              <button
                key={tag}
                type="button"
                className={`chip${on ? ' on' : ''}`}
                aria-pressed={on}
                onClick={() => setBodyFilter((p) => toggleIn(p, tag))}
              >
                {bodyChipLabel(tag)}
              </button>
            )
          })}
        </div>
        <div
          className="filters filters-lg"
          role="group"
          aria-label="Equipment filter"
        >
          {equipChips.map((tag) => {
            const on = equipFilter.includes(tag)
            return (
              <button
                key={tag}
                type="button"
                className={`chip${on ? ' on' : ''}`}
                aria-pressed={on}
                onClick={() => setEquipFilter((p) => toggleIn(p, tag))}
              >
                {tag}
              </button>
            )
          })}
        </div>

        <p className="match-count">
          {filtered.length} available
          {picked.length ? ` · ${picked.length} picked` : ''}
        </p>

        <div className="catalogue-list">
          {filtered.slice(0, 60).map((ex) => (
            <button
              key={ex.name}
              type="button"
              className="catalogue-row"
              onClick={() => addExercise(ex)}
            >
              <span className="catalogue-name">{ex.name}</span>
              <span className="catalogue-meta">
                {[
                  ex.body.slice(0, 2).map(bodyChipLabel).join(', '),
                  ex.commonSets && ex.commonReps
                    ? `${ex.commonSets}×${ex.commonReps}`
                    : null,
                ]
                  .filter(Boolean)
                  .join(' · ') || 'Add'}
              </span>
              <span className="catalogue-add">+</span>
            </button>
          ))}
          {filtered.length > 60 ? (
            <p className="empty soft">Refine search to see more.</p>
          ) : null}
          {filtered.length === 0 ? (
            <p className="empty soft">No matches — clear filters or search.</p>
          ) : null}
        </div>
      </section>

      {error ? <p className="form-error">{error}</p> : null}

      <div className="actions">
        <button type="button" className="btn btn-primary" onClick={onSave}>
          Save routine
        </button>
        <Link
          className="btn btn-secondary"
          to={editing ? `/workout/${editing.id}` : '/library'}
        >
          Cancel
        </Link>
      </div>
    </main>
  )
}
