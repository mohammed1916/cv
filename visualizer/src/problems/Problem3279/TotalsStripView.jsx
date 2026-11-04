import "./TotalsStripView.css";

export default function TotalsStripView({ step }) {
  const totals = step.history ?? []
  const max = Math.max(1, ...totals, step.total ?? 0)
  const slots = Array.from({ length: step.period }, (_, t) => t)
  return (
    <div className="ts-view" aria-label="Total area at each time">
      <div className="ts-strip">
        {slots.map(t => {
          const value = totals[t]
          const height = value === undefined ? 0 : Math.round((value / max) * 100)
          const now = step.t === t
          const best = step.bestTime === t && value !== undefined
          return <div key={t} title={`time ${t}: ${value ?? "not yet"}`}
            className={`ts-bar ${now ? "is-now" : ""} ${best ? "is-best" : ""}`}
            style={{ height: `${height}%` }} />
        })}
      </div>
      <p className="ts-note">One bar per integer time from 0 to {step.period - 1}. The bar for the current time is highlighted and the best time has an outline.</p>
    </div>
  )
}
