import type { MouseEvent } from 'react'
import { getRating, setRating, type WorkoutRating } from '../lib/storage'

type Props = {
  workoutId: string
  value?: WorkoutRating
  onChange?: (rating: WorkoutRating) => void
  size?: 'sm' | 'md'
}

export function StarRating({ workoutId, value, onChange, size = 'sm' }: Props) {
  const rating = value ?? getRating(workoutId)

  function pick(e: MouseEvent, n: WorkoutRating) {
    e.preventDefault()
    e.stopPropagation()
    const next: WorkoutRating = rating === n ? 0 : n
    setRating(workoutId, next)
    onChange?.(next)
  }

  return (
    <div
      className={`star-rating star-rating-${size}`}
      role="group"
      aria-label="Rate workout"
      onClick={(e) => e.preventDefault()}
    >
      {([1, 2, 3, 4, 5] as WorkoutRating[]).map((n) => (
        <button
          key={n}
          type="button"
          className={`star-btn${rating >= n ? ' on' : ''}`}
          aria-label={`${n} star${n === 1 ? '' : 's'}`}
          aria-pressed={rating >= n}
          onClick={(e) => pick(e, n)}
        >
          ★
        </button>
      ))}
    </div>
  )
}
