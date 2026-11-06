import './SwapTrackView.css'

// The array as tiles after each adjacent swap. Blue is the smallest value, red the largest,
// the yellow ring marks the value moving, and dashed tiles were just swapped.
export default function SwapTrackView({ run, step }) {
  const values = step.array
  const lo = Math.min(...run.input.nums)
  const hi = Math.max(...run.input.nums)
  return (
    <div className="swap-view">
      <div className="swap-row" role="list" aria-label="Array state">
        {values.map((v, i) => {
          const classes = ['swap-tile']
          if (v === lo) classes.push('swap-tile--min')
          if (v === hi) classes.push('swap-tile--max')
          if (i === step.moving) classes.push('swap-tile--moving')
          if (step.swapped && (step.swapped[0] === i || step.swapped[1] === i)) classes.push('swap-tile--swapped')
          return <span key={i} role="listitem" className={classes.join(' ')}>{v}</span>
        })}
      </div>
      <div className="swap-index" aria-hidden="true">{values.map((_, i) => <span key={i}>{i}{i === step.moving && <b className="swap-pointer"> k</b>}</span>)}</div>
      <p className="swap-caption">{step.phase === 'front' ? 'Moving the smallest value to the front.' : step.phase === 'back' ? 'Moving the largest value to the back.' : step.phase === 'done' ? 'The array is valid.' : 'Preparing the moves.'}</p>
      <p className="swap-count">Swaps so far: {step.swaps}</p>
    </div>
  )
}
