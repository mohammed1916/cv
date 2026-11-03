import './ChainStackView.css'

// The chain is drawn left to right. The stack fills while walking forward, then drains from its top
// while the printed column grows from the bottom in reverse order.
export default function ChainStackView({ run, step }) {
  const values = run.input
  return <div className="chain-view">
    <section className="chain-view__chain" aria-label="Immutable linked list">
      <span className="chain-view__label">list</span>
      {values.map((value, index) => {
        const classes = ['chain-view__node']
        if (index < step.walked) classes.push('is-walked')
        if (index === step.current) classes.push('is-current')
        if (index === step.popped) classes.push('is-popped')
        return <span key={index} className="chain-view__link">
          <span className={classes.join(' ')}>
            <strong>{value}</strong>
            <small>node {index}</small>
          </span>
          {index < values.length - 1 && <span className="chain-view__arrow" aria-hidden="true">→</span>}
        </span>
      })}
    </section>
    <div className="chain-view__columns">
      <section className="chain-view__stack" aria-label="Stack of nodes">
        <span className="chain-view__label">stack (top first)</span>
        <ol>
          {step.stack.length === 0 && <li className="chain-view__empty">empty</li>}
          {step.stack.slice().reverse().map(index => <li key={index} className={index === step.current ? 'is-top' : ''}>
            node {index} · {values[index]}
          </li>)}
        </ol>
      </section>
      <section className="chain-view__output" aria-label="Printed output">
        <span className="chain-view__label">printed</span>
        <ol>
          {step.printed.length === 0 && <li className="chain-view__empty">nothing yet</li>}
          {step.printed.map((value, k) => <li key={k}>{value}</li>)}
        </ol>
      </section>
    </div>
    <output aria-label="Walk readout">
      {step.popped !== null ? `printed node ${step.popped}` : step.current !== null ? `walking: node ${step.current} pushed` : 'ready'}
    </output>
  </div>
}
