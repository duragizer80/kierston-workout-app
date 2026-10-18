import { useEffect, useState } from 'react'

type Props = {
  suggestedSeconds: number | null
}

function formatClock(total: number) {
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function RestTimer({ suggestedSeconds }: Props) {
  const defaultSecs = suggestedSeconds && suggestedSeconds > 0 ? suggestedSeconds : 90
  const [seconds, setSeconds] = useState(defaultSecs)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    setSeconds(defaultSecs)
    setRunning(false)
  }, [defaultSecs])

  useEffect(() => {
    if (!running) return
    if (seconds <= 0) {
      setRunning(false)
      return
    }
    const id = window.setTimeout(() => setSeconds((s) => s - 1), 1000)
    return () => window.clearTimeout(id)
  }, [running, seconds])

  return (
    <div className="timer">
      <div className="clock">{formatClock(seconds)}</div>
      <div className="timer-actions">
        <button type="button" className="btn btn-secondary" onClick={() => setRunning((r) => !r)}>
          {running ? 'Pause' : seconds === 0 ? 'Restart' : 'Start rest'}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            setSeconds(defaultSecs)
            setRunning(false)
          }}
        >
          Reset
        </button>
      </div>
    </div>
  )
}
