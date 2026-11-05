import RecordStateTable from '../../components/shared/RecordStateTable'

// Left: the best single-tire time for each stint length. Right: the lap table f, where f[i] uses the last stint j.
export default function RaceView({ run, step }) {
  const costRows = []
  for (let j = 1; j <= Math.min(8, run.input.numLaps); j++) costRows.push({ stint: j, best: Number.isFinite(step.cost[j]) ? step.cost[j] : '-' })
  const lapRows = []
  const last = step.phase === 'dp' ? step.index : step.phase === 'done' ? run.input.numLaps : -1
  for (let i = 0; i <= run.input.numLaps && last >= 0 && i <= last; i++) lapRows.push({ laps: i, best: Number.isFinite(step.f?.[i]) ? step.f[i] : '-' })
  return (
    <div className="race-view">
      <p>Tires [first lap, growth]: {run.input.tires.map(t => `[${t.join(', ')}]`).join(' ')}. Change costs {run.input.changeTime}.</p>
      <div className="race-tables">
        <RecordStateTable label="Stint cost" columns={['stint', 'best']} rows={costRows} />
        <RecordStateTable label="Best time for the first i laps" columns={['laps', 'best']} rows={lapRows} activeRow={lapRows.length - 1} />
      </div>
      <p>{step.message}</p>
    </div>
  )
}
