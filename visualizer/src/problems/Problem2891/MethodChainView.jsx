import { LIMIT, stages } from './algorithm'

// The chain as a pipeline with live row counts, above the DataFrame that the current link holds.
function Pipeline({ step, frames }) {
  const at = stages.findIndex(stage => stage.id === step.stage)
  const counted = stage => [...frames].reverse().find(frame => frame.stage === stage.id && frame.stage !== 'mask')?.rows.length
  return <ol aria-label="Method chain" style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'stretch' }}>
    {stages.map((stage, index) => {
      const state = index === at ? 'current' : index < at ? 'past' : 'future'
      const rows = counted(stage)
      return <li key={stage.id} data-stage={stage.id} data-state={state} aria-current={state === 'current' ? 'step' : undefined} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {index > 0 && <span aria-hidden="true" style={{ color: 'var(--text-muted)' }}>→</span>}
        <div style={{ padding: '4px 8px', borderRadius: 6, border: `2px solid ${state === 'current' ? 'var(--primary)' : 'var(--border)'}`, background: state === 'current' ? 'color-mix(in srgb, var(--primary) 16%, var(--surface))' : 'var(--surface2)', opacity: state === 'future' ? 0.6 : 1 }}>
          <code style={{ fontSize: 12, color: 'var(--text)' }}>{stage.label}</code>
          <small style={{ display: 'block', color: 'var(--text-muted)' }}>{stage.id === 'mask' ? 'true / false per row' : index <= at && rows !== undefined ? `${rows} row${rows === 1 ? '' : 's'}` : ' '}</small>
        </div>
      </li>
    })}
  </ol>
}

const cell = { padding: '3px 8px', borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text)', whiteSpace: 'nowrap' }

function WeightCell({ weight, max }) {
  const width = Math.max(0, weight / max) * 100
  return <td style={{ ...cell, minWidth: 170 }}>
    <div style={{ position: 'relative', height: 20, background: 'var(--surface2)', borderRadius: 3 }}>
      <div style={{ position: 'absolute', inset: 0, width: `${width}%`, borderRadius: 3, background: `color-mix(in srgb, ${weight > LIMIT ? 'var(--success)' : 'var(--text-muted)'} 34%, transparent)` }} />
      <div aria-hidden="true" title="100 kg" style={{ position: 'absolute', top: -2, bottom: -2, left: `${(LIMIT / max) * 100}%`, borderLeft: '2px dashed var(--error)' }} />
      <span style={{ position: 'relative', paddingLeft: 4, fontSize: 12, lineHeight: '20px' }}>{weight}</span>
    </div>
  </td>
}

export default function MethodChainView({ run, step }) {
  const max = Math.max(LIMIT * 1.25, ...run.input.animals.map(entry => entry.weight))
  const showMask = step.stage === 'mask'
  const finalOutput = step.phase === 'done'
  return <section aria-label="Method chain on a DataFrame" style={{ display: 'grid', gap: 10, color: 'var(--text)' }}>
    <Pipeline step={step} frames={run.frames} />
    <div style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13 }}>
        <caption style={{ textAlign: 'left', fontWeight: 600, padding: '4px 0', color: 'var(--text)' }}>{finalOutput ? 'Returned DataFrame' : 'DataFrame at this link'} <small style={{ fontWeight: 400, color: 'var(--text-muted)' }}>the dashed line marks 100 kg</small></caption>
        <thead><tr>
          <th scope="col" style={cell}>index</th>
          {step.columns.map(column => <th key={column} scope="col" style={cell}>{column}</th>)}
          {showMask && <th scope="col" style={cell}>weight &gt; 100</th>}
          {step.stage === 'sort' && <th scope="col" style={cell}>position</th>}
        </tr></thead>
        <tbody>
          {step.rows.length === 0 && <tr><td colSpan={step.columns.length + 1} style={{ ...cell, color: 'var(--text-muted)' }}>No rows</td></tr>}
          {step.rows.map((entry, position) => {
            const value = step.mask[entry.row]
            const isCurrent = position === step.current
            const isPlaced = step.stage === 'sort' && position < step.placed
            return <tr key={entry.row} data-row={entry.row} aria-current={isCurrent ? 'step' : undefined} style={{ background: isCurrent ? 'color-mix(in srgb, var(--primary) 16%, var(--surface))' : 'transparent', opacity: showMask && value === false ? 0.55 : 1 }}>
              <td style={{ ...cell, color: 'var(--text-muted)' }}>{entry.row}</td>
              {step.columns.map(column => column === 'weight'
                ? <WeightCell key={column} weight={entry.weight} max={max} />
                : <td key={column} style={{ ...cell, fontWeight: column === 'name' ? 600 : 400 }}>{String(entry[column])}</td>)}
              {showMask && <td style={{ ...cell, fontWeight: 700, color: value === null ? 'var(--text-muted)' : value ? 'var(--success)' : 'var(--error)' }}>{value === null ? '·' : value ? 'True' : 'False'}</td>}
              {step.stage === 'sort' && <td style={{ ...cell, color: isPlaced ? 'var(--success)' : 'var(--text-muted)' }}>{isPlaced ? `placed ${position}` : 'unsorted'}</td>}
            </tr>
          })}
        </tbody>
      </table>
    </div>
    <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>The index column keeps each row's original label, so you can see that filtering and sorting move rows rather than rewriting them.</p>
  </section>
}
