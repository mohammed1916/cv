import './RoundTableView.css'

const ARROW = { rise: '▲', fall: '▼', hold: '•' }

// Each row is one round. The newest row is at the bottom, and the cell being decided is outlined.
export default function RoundTableView({ run, step }) {
  const rows = step.history
  return <div className="rounds-view">
    <table aria-label="Rounds of the transformation">
      <thead>
        <tr>
          <th scope="col">round</th>
          {run.input.map((_, index) => <th key={index} scope="col">{index === 0 || index === run.input.length - 1 ? `end ${index}` : index}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, r) => <tr key={r} className={r === step.round ? 'is-current-round' : ''}>
          <th scope="row">{r}</th>
          {row.map((value, index) => {
            const classes = []
            if (index === 0 || index === row.length - 1) classes.push('is-endpoint')
            if (r > 0 && rows[r - 1][index] !== value) classes.push('is-changed')
            if (r === step.round && index === step.i) classes.push('is-deciding', `is-${step.decision}`)
            return <td key={index} className={classes.join(' ')}>
              {value}
              {r === step.round && index === step.i && step.decision && <sup aria-label={step.decision}>{ARROW[step.decision]}</sup>}
            </td>
          })}
        </tr>)}
      </tbody>
    </table>
    <output aria-label="Round readout">
      {step.decision ? `round ${step.round}: index ${step.i} ${step.decision === 'hold' ? 'holds' : step.decision === 'rise' ? 'rises' : 'falls'}` : `round ${step.round}`}
    </output>
  </div>
}
