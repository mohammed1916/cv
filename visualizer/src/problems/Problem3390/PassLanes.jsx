import RecordStateTable from '../../components/shared/RecordStateTable'

const COLUMNS = ['pass_from', 'time_stamp', 'pass_to', 'team_from', 'team_to', 'kept']
const CHIP = 62

function chipStyle(chip, active) {
  const tone = chip.kept ? 'var(--success)' : 'var(--error)'
  return {
    width: CHIP, minHeight: 46, boxSizing: 'border-box', borderRadius: 8, padding: '3px 2px', textAlign: 'center', fontSize: 12, color: 'var(--text)',
    border: `${active ? 3 : 1}px ${chip.seen ? 'solid' : 'dashed'} ${chip.seen ? tone : 'var(--border)'}`,
    background: chip.seen ? `color-mix(in srgb, ${tone} 18%, var(--surface2))` : 'var(--surface2)',
  }
}

// One lane per team along a shared time axis, so a run reads left to right and a rival's pass visibly sits in another lane.
function Lanes({ step }) {
  const { names, chips } = step
  const cell = { fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }
  return <div style={{ overflowX: 'auto' }}>
    <div role="table" aria-label="Passes by team over time" style={{ display: 'grid', gridTemplateColumns: `110px repeat(${chips.length}, ${CHIP}px) 56px 56px`, gap: 5, alignItems: 'center', width: 'max-content' }}>
      <div style={{ ...cell, textAlign: 'left' }}>team / time</div>
      {chips.map((chip, i) => <div key={i} style={{ ...cell, fontWeight: i === step.activeChip ? 700 : 400, color: i === step.activeChip ? 'var(--text)' : 'var(--text-muted)' }}>{chip.time}</div>)}
      <div style={cell}>run</div>
      <div style={cell}>best</div>
      {names.map(name => [
        <strong key={name} style={{ fontSize: 13, overflowWrap: 'anywhere' }}>{name}</strong>,
        ...chips.map((chip, i) => <div key={`${name}-${i}`} style={{ minHeight: 46 }}>
          {chip.team === name && <div data-chat-selectable data-index={i} data-chat-label={`Pass at ${chip.time}`} style={chipStyle(chip, i === step.activeChip)}>
            <div>{chip.from}→{chip.to}</div>
            <strong style={{ fontSize: 14 }}>{!chip.seen ? '' : chip.kept ? chip.run : '✕'}</strong>
          </div>}
        </div>),
        <strong key={`${name}-run`} style={{ textAlign: 'center', fontSize: 16 }}>{step.streak[name]}</strong>,
        <strong key={`${name}-best`} style={{ textAlign: 'center', fontSize: 16, color: 'var(--success)' }}>{step.best[name] ?? '–'}</strong>,
      ])}
    </div>
  </div>
}

export default function PassLanes({ run, step }) {
  const rosters = Object.entries(run.input.teams)
  const walking = step.chips.length > 0
  return <section aria-label="Pass streaks" style={{ display: 'grid', gap: 14, color: 'var(--text)' }}>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }} aria-label="Teams">
      {rosters.map(([name, players]) => <span key={name} style={{ padding: '4px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface2)', fontSize: 13 }}><strong>{name}</strong>: {players.join(', ')}</span>)}
    </div>
    {walking && <Lanes step={step} />}
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start' }}>
      <RecordStateTable label={walking ? 'Passes in time order' : 'Passes with both teams looked up'} columns={COLUMNS} rows={step.rows} activeRow={step.activeRow} />
      {step.phase === 'done' && <RecordStateTable label="Result" columns={['team_name', 'longest_streak']} rows={step.output} />}
    </div>
  </section>
}
