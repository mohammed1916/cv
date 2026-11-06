import RecordStateTable from '../../components/shared/RecordStateTable'

// The floor is a row of tiles (white tiles filled). The table is dp: rows are tiles, columns are carpets used so far.
export default function FloorView({ run, step }) {
  const { floor, numCarpets } = run.input
  const cols = Array.from({ length: numCarpets + 1 }, (_, c) => c)
  const rows = step.dp.map((row, i) => {
    const r = { tiles: i }
    cols.forEach(c => { r[`carpets ${c}`] = row[c] })
    return r
  })
  return (
    <div className="floor-view">
      <div className="floor-row" role="img" aria-label={`Floor ${floor}`}>
        {floor.split('').map((t, i) => <div key={i} className={`floor-tile${t === '1' ? ' is-white' : ''}${i === step.i - 1 ? ' is-current' : ''}`}>{t}{i === step.i - 1 && <sup className="floor-pointer">i</sup>}</div>)}
      </div>
      <RecordStateTable label="dp: tiles covered so far by carpets used" columns={['tiles', ...cols.map(c => `carpets ${c}`)]} rows={rows} activeRow={step.i ?? -1} />
      <p>{step.message}</p>
    </div>
  )
}
