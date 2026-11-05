import RecordStateTable from '../../components/shared/RecordStateTable'

// Cars are cells: illegal cars are filled. The cut marks how many cars sit on the left of the split being tested.
export default function CarsView({ run, step }) {
  const { s } = run.input
  const cut = step.cut ?? -1
  const rows = s.split('').map((car, i) => ({ car: i, state: car === '1' ? 'illegal' : 'clean', pre: step.pre[i + 1] ?? '', suf: step.suf[i] ?? '' }))
  return (
    <div className="cars-view">
      <div className="cars-row" role="img" aria-label={`Cars ${s}`}>
        {s.split('').map((car, i) => <div key={i} className={`car-cell${car === '1' ? ' is-illegal' : ''}${i === step.index && step.phase !== 'split' ? ' is-current' : ''}`}>
          <small>car {i}</small><strong>{car}</strong>
          {cut === i + 1 && <span className="car-cut">cut</span>}
        </div>)}
      </div>
      <p>{cut >= 0 ? `Testing a cut after ${cut} cars. Left ${step.pre[cut]} + right ${step.suf[cut]} = ${step.pre[cut] + step.suf[cut]}.` : 'Left cost table pre and right cost table suf fill in.'}</p>
      <RecordStateTable label="Cost tables" columns={['car', 'state', 'pre', 'suf']} rows={rows} activeRow={step.index} />
      <p>Best total so far: {Number.isFinite(step.best) ? step.best : '-'}</p>
    </div>
  )
}
