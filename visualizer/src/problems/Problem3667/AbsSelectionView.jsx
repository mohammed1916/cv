import './AbsSelectionView.css'

// Top lane: values still unplaced. Bottom lane: the result built so far. The candidate being
// compared is dashed, the current best is solid and shaded, and each absolute value is shown.
export default function AbsSelectionView({ run, step }) {
  const cell = (index, role) => <li key={`${role}-${index}`} className="abs-select__cell" data-role={role || undefined}>
    <span>index {index}</span>
    <strong>{run.input[index]}</strong>
    <span>|x| = {Math.abs(run.input[index])}</span>
  </li>
  return <div className="abs-select" style={{ '--accent': 'var(--info)' }}>
    <p className="abs-select__label">Remaining</p>
    <ol className="abs-select__lane" aria-label="Remaining values">
      {step.remaining.map((index, pos) => {
        let role = ''
        if (step.m !== null && pos === step.m) role = 'best'
        if (step.i !== null && pos === step.i) role = 'scan'
        return cell(index, role)
      })}
    </ol>
    <p className="abs-select__label">Result</p>
    <ol className="abs-select__lane" aria-label="Result so far">
      {step.result.map(index => cell(index, 'taken'))}
    </ol>
    <p>{step.message}</p>
  </div>
}
