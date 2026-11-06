import './SemiWindowView.css'

// The array is a row of cells; cells inside the window are shaded green. The right edge
// and left edge are outlined. The count table lists each value in the window, and values
// that occur twice or more are bold, since each of those counts toward k.
export default function SemiWindowView({ run, step }) {
  const [left, right] = step.window || [0, -1]
  const counts = Object.entries(step.counts).filter(([, c]) => c > 0)
  return <div className="semi-window" style={{ '--accent': 'var(--success)' }}>
    <ol className="semi-window__row" aria-label="Array with window">
      {run.input.nums.map((value, index) => {
        const inWindow = step.window && index >= left && index <= right
        let edge = ''
        if (step.window && index === right) edge = 'right'
        else if (step.window && index === left && inWindow) edge = 'left'
        const isBest = step.bestRange && index >= step.bestRange[0] && index <= step.bestRange[1] && step.best > 0
        return <li key={index} className="semi-window__cell" data-in={inWindow ? 'yes' : undefined} data-edge={edge || undefined} data-best={isBest ? 'yes' : undefined}>
          {value}
        </li>
      })}
    </ol>
    <ul className="semi-window__table" aria-label="Counts in the window">
      {counts.map(([value, count]) => <li key={value} data-repeated={count >= 2 ? 'yes' : undefined}>{value}: {count}</li>)}
    </ul>
    <p className="semi-window__readout">Repeated values: {step.repeated} of at most {run.input.k} · Best: {step.best}</p>
    <p>{step.message}</p>
  </div>
}
