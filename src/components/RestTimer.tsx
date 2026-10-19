import { useEffect, useRef, useState } from 'react'

type Props = {
  suggestedSeconds: number | null
  /** Bump this when a set is checked complete to auto-offer/start rest. */
  triggerKey?: number
  /** When true, do not auto-start (e.g. final set of the workout). */
  suppressAuto?: boolean
}

function formatClock(total: number) {
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function defaultRest(suggested: number | null): number {
  if (suggested && suggested > 0) return suggested
  return 75
}

export function RestTimer({
  suggestedSeconds,
  triggerKey = 0,
  suppressAuto = false,
}: Props) {
  const base = defaultRest(suggestedSeconds)
  const [seconds, setSeconds] = useState(base)
  const [running, setRunning] = useState(false)
  const [visible, setVisible] = useState(true)
  const lastTrigger = useRef(0)

  useEffect(() => {
    setSeconds(base)
    setRunning(false)
  }, [base])

  useEffect(() => {
    if (!triggerKey || triggerKey === lastTrigger.current) return
    lastTrigger.current = triggerKey
    if (suppressAuto) {
      setVisible(false)
      setRunning(false)
      return
    }
    setSeconds(base)
    setVisible(true)
    setRunning(true)
  }, [triggerKey, suppressAuto, base])

  useEffect(() => {
    if (!running) return
    if (seconds <= 0) {
      setRunning(false)
      try {
        if (navigator.vibrate) navigator.vibrate(40)
      } catch {
        /* ignore */
      }
      return
    }
    const id = window.setTimeout(() => setSeconds((s) => s - 1), 1000)
    return () => window.clearTimeout(id)
  }, [running, seconds])

  if (!visible && !running) {
    return (
      <div className="timer timer-collapsed">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            setSeconds(base)
            setVisible(true)
            setRunning(true)
          }}
        >
          Start rest ({formatClock(base)})
        </button>
      </div>
    )
  }

  const done = seconds <= 0

  return (
    <div className={`timer${running ? ' timer-live' : ''}${done ? ' timer-done' : ''}`}>
      <div className="timer-label">{done ? 'Rest done' : running ? 'Resting' : 'Rest timer'}</div>
      <div className="clock" aria-live="polite">
        {formatClock(Math.max(0, seconds))}
      </div>
      <div className="timer-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setRunning((r) => !r)}
        >
          {running ? 'Pause' : done ? 'Restart' : 'Start'}
        </button>
        <button
          type="button"
          className="btn btn-ghost timer-adj"
          onClick={() => setSeconds((s) => s + 15)}
        >
          +15s
        </button>
        <button
          type="button"
          className="btn btn-ghost timer-adj"
          onClick={() => setSeconds((s) => s + 30)}
        >
          +30s
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            setRunning(false)
            setVisible(false)
            setSeconds(base)
          }}
        >
          Skip
        </button>
      </div>
    </div>
  )
}
