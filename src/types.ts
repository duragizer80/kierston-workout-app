export type Exercise = {
  name: string
  block: string | null
  sets: string | null
  reps: string | null
  rest: string | null
  tempo: string | null
  load_notes: string | null
  unclear: string[]
}

export type Workout = {
  id: string
  date: string | null
  source_email: string
  email_date: string
  name: string
  focus: string | null
  notes: string | null
  warm_up: string | null
  general_instructions: string | null
  exercises: Exercise[]
}

export type SetLog = {
  weight: string
  reps: string
  done: boolean
}

export type ExerciseLog = {
  exerciseName: string
  sets: SetLog[]
}

export type SessionRecord = {
  id: string
  workoutId: string
  workoutName: string
  completedAt: string
  exercises: ExerciseLog[]
}

export type LastPerf = {
  weight: string
  reps: string
  completedAt: string
}
