import './WindowModeView.css'

// The current window is shaded in the array. The count table lists each value in the window,
// and the chosen mode is bold and outlined. The running total is shown as a readout.
export default function WindowModeView({ run, step }) {
  const { nums, k } = run.input
  const inWindow = i => step.start !== null && i >= step.start && i < step.start + k
  const counts = Object.entries(step.counts)
  return <div className="window-mode" style={{ '--accent': '#b45309' }}>
    <ol className="window-mode__row" aria-label="Array with window">
      {nums.map((value, i) => <li key={i} className="window-mode__cell" data-in={inWindow(i) ? 'yes' : undefined}
        data-mode={step.best !== null && inWindow(i) && value === step.best ? 'yes' : undefined}>{value}</li>)}
    </ol>
    <ul className="window-mode__table" aria-label="Counts in the window">
      {counts.map(([value, count]) => <li key={value} data-mode={String(value) === String(step.best) ? 'yes' : undefined}>{value}: {count}</li>)}
    </ul>
    <p className="window-mode__readout">Running total: {step.total}</p>
    <p>{step.message}</p>
  </div>
}
