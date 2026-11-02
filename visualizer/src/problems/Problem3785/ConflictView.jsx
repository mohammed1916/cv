const cell = { padding: '4px 6px', textAlign: 'center', border: '1px solid currentColor', minWidth: 34 }
const badge = { display: 'inline-block', padding: '2px 8px', border: '1px solid currentColor', borderRadius: 4, marginRight: 6 }

export default function ConflictView({ run, step }) {
  const { nums, forbidden } = run.input
  const n = nums.length
  const bad = new Set(step.bad)
  const max = Math.max(n, ...step.counts.map(c => c.count))
  const groupPositions = (step.groups || []).map(g => ({
    value: g.value,
    count: g.count,
    positions: step.bad.filter(i => nums[i] === g.value),
  }))
  const boundsKnown = step.half !== null && step.most !== null
  return <div style={{ display: 'grid', gap: 14 }}>
    <section aria-label="Aligned positions">
      <table style={{ borderCollapse: 'collapse' }}>
        <caption style={{ textAlign: 'left' }}>Aligned positions (X marks a found conflict)</caption>
        <tbody>
          <tr>
            <th style={cell} scope="row">index</th>
            {nums.map((_, i) => <th key={i} style={{ ...cell, fontWeight: i === step.at ? 700 : 400, outline: i === step.at ? '2px solid currentColor' : 'none' }}>{i}</th>)}
          </tr>
          <tr>
            <th style={cell} scope="row">nums</th>
            {nums.map((v, i) => <td key={i} style={cell}>{v}</td>)}
          </tr>
          <tr>
            <th style={cell} scope="row">forbidden</th>
            {forbidden.map((v, i) => <td key={i} style={cell}>{v}</td>)}
          </tr>
          <tr>
            <th style={cell} scope="row">conflict</th>
            {nums.map((_, i) => <td key={i} style={{ ...cell, fontWeight: 700 }} aria-label={bad.has(i) ? `index ${i} conflict` : `index ${i} clear`}>{bad.has(i) ? 'X' : ''}</td>)}
          </tr>
        </tbody>
      </table>
    </section>

    <section aria-label="Combined frequency against capacity">
      <p style={{ margin: '0 0 6px' }}>Combined frequency across nums and forbidden. Capacity is n = {n}; a value above the dashed line cannot be placed.</p>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', gap: 8, height: 120, borderBottom: '1px solid currentColor', padding: '0 4px' }}>
        <div aria-hidden="true" style={{ position: 'absolute', left: 0, right: 0, bottom: `${(n / max) * 100}%`, borderTop: '2px dashed currentColor' }} />
        {step.counts.map(c => <div key={c.value} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 36 }}>
          <span style={{ fontSize: 12 }}>{c.count}</span>
          <div aria-label={`value ${c.value} count ${c.count}`} style={{
            width: '100%', height: `${(c.count / max) * 100}px`, minHeight: 2,
            border: '1px solid currentColor',
            outline: step.violator === c.value ? '3px solid currentColor' : 'none',
            opacity: step.checking !== null && step.checking !== c.value ? 0.45 : 1,
          }} />
          <span style={{ fontSize: 12 }}>{c.value}</span>
        </div>)}
      </div>
      {step.violator !== null && <p role="status" style={{ margin: '6px 0 0' }}>Value {step.violator} appears {step.counts.find(c => c.value === step.violator)?.count} times, which is more than n = {n}. No arrangement can work.</p>}
    </section>

    <section aria-label="Conflict groups by value">
      <p style={{ margin: '0 0 6px' }}>Bad positions grouped by value</p>
      {groupPositions.length === 0
        ? <p style={{ margin: 0 }}>{step.total === null ? 'Conflicts are still being found.' : step.total === 0 ? 'No conflicts yet.' : ''}</p>
        : <ul style={{ margin: 0, paddingLeft: 18 }}>{groupPositions.map(g => <li key={g.value}>value {g.value}: {g.count} at positions {g.positions.join(', ')}</li>)}</ul>}
    </section>

    <section aria-label="Lower bounds">
      <p style={{ margin: '0 0 6px' }}>Lower bounds on swaps</p>
      <div>
        <span style={{ ...badge, fontWeight: step.chosen === 'half' ? 700 : 400, outline: step.chosen === 'half' ? '2px solid currentColor' : 'none' }}>
          ceil(conflicts / 2) = {boundsKnown ? step.half : 'pending'}
        </span>
        <span style={{ ...badge, fontWeight: step.chosen === 'group' ? 700 : 400, outline: step.chosen === 'group' ? '2px solid currentColor' : 'none' }}>
          largest group = {step.most ?? 'pending'}
        </span>
      </div>
      <p aria-label="Bound state" style={{ margin: '6px 0 0' }}>
        {`conflicts = ${step.total ?? 'counting'}, `}
        {step.chosen === 'group' ? 'the largest group decides the answer' : step.chosen === 'half' ? 'the half bound decides the answer' : step.chosen === 'none' ? 'no conflicts' : 'bounds not yet compared'}
        {step.result !== undefined && step.result !== -1 ? `, result = ${step.result}` : ''}
        {step.result === -1 ? ', result = -1' : ''}
      </p>
    </section>
  </div>
}
