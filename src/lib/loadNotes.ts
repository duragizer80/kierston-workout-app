/**
 * Best-effort parse of trainer load_notes into weight (and optional reps) hints.
 * Examples: "15lbs", "30lb kettlebell", "10lb dumbbells", "209lbs"
 */
export function parseLoadNotes(
  notes: string | null | undefined,
): { weight: string; reps: string } | null {
  if (!notes) return null
  const text = notes.trim()
  if (!text) return null

  // Prefer explicit weight like 12.5lbs / 30lb / 15 lb
  const weightMatch = text.match(
    /(\d+(?:\.\d+)?)\s*(?:lb|lbs|pounds?)(?:\s*(?:dumbbells?|kettlebells?|kb|dbs?|plates?))?/i,
  )
  if (!weightMatch) return null

  const weight = weightMatch[1]
  const repsMatch = text.match(/(\d+)\s*(?:reps?|x)\b/i)
  return {
    weight,
    reps: repsMatch ? repsMatch[1] : '',
  }
}
