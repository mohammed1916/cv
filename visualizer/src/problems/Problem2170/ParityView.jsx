import RecordStateTable from '../../components/shared/RecordStateTable'

// Positions are split by parity. Each class has its own frequency table; the picked values are the modes.
export default function ParityView({ run, step }) {
  const { nums } = run.input
  const rows = (parity, top) => [
    { class: parity, rank: 'most common', value: top.v0 ?? '-', count: top.c0 },
    { class: parity, rank: 'runner-up', value: top.v1 ?? '-', count: top.c1 },
  ]
  return (
    <div className="parity-view">
      <div className="parity-row" role="img" aria-label={`Array ${nums.join(', ')} split by parity`}>
        {nums.map((v, i) => <div key={i} className={`parity-cell ${i % 2 === 0 ? 'is-even' : 'is-odd'}${i === step.counted ? ' is-current' : ''}`}>
          <small>{i % 2 === 0 ? 'even' : 'odd'} {i}</small><strong>{v}</strong>
        </div>)}
      </div>
      <RecordStateTable label="Even positions" columns={['class', 'rank', 'value', 'count']} rows={rows('even', step.even)} />
      <RecordStateTable label="Odd positions" columns={['class', 'rank', 'value', 'count']} rows={rows('odd', step.odd)} />
    </div>
  )
}
