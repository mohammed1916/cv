import IndexedSequence from '../../components/shared/IndexedSequence'

const cellStyle = { display: 'inline-block', minWidth: 44, margin: 2, padding: '4px 6px', borderRadius: 6, border: '1px solid currentColor', textAlign: 'center', fontSize: 13 }
const groupStyle = { flex: '1 1 180px', minWidth: 180 }

function Group({ title, indices, empty, tone }) {
  return <div style={groupStyle}>
    <strong>{title}</strong>
    <div aria-label={`${title} positions`} style={{ minHeight: 30 }}>
      {indices.length === 0
        ? <span style={{ opacity: 0.7 }}>{empty}</span>
        : indices.map(i => <span key={i} style={{ ...cellStyle, background: tone }}>{i}</span>)}
    </div>
  </div>
}

export default function View3800({ run, step }) {
  const { s, t } = run.input
  const kinds = step.kinds ?? s.split('').map(() => null)
  const processed = kinds.map((k, i) => (k === null ? null : i)).filter(i => i !== null)
  const unprocessed = kinds.filter(k => k === null).length
  const posA = kinds.map((k, i) => (k === 'A' ? i : null)).filter(i => i !== null)
  const posB = kinds.map((k, i) => (k === 'B' ? i : null)).filter(i => i !== null)
  const posSame = kinds.map((k, i) => (k === 'same' ? i : null)).filter(i => i !== null)
  const scanning = step.phase === 'start' || step.phase === 'scan'
  const winner = step.winner
  const tested = step.tested ?? []
  const current = step.index >= 0 ? step.index : -1

  return <div style={{ display: 'grid', gap: 12 }}>
    <IndexedSequence label="s" length={s.length} valueAt={i => s[i]} active={current}
      roleAt={i => (kinds[i] === null ? 'unprocessed' : kinds[i] === 'same' ? 'agrees' : `type ${kinds[i]}`)} />
    <IndexedSequence label="t" length={t.length} valueAt={i => t[i]} active={current}
      roleAt={i => (kinds[i] === null ? 'unprocessed' : kinds[i] === 'same' ? 'agrees' : `type ${kinds[i]}`)} />

    <section aria-label="Classification of processed positions" style={{ display: 'grid', gap: 6 }}>
      <h3 style={{ margin: 0 }}>Classification so far</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        <Group title="Type A (s 0, t 1)" indices={posA} empty="none yet" tone="rgba(37, 99, 235, 0.18)" />
        <Group title="Type B (s 1, t 0)" indices={posB} empty="none yet" tone="rgba(220, 38, 38, 0.18)" />
        <Group title="Agree (not counted)" indices={posSame} empty="none yet" tone="rgba(100, 116, 139, 0.15)" />
        <Group title="Unprocessed" indices={kinds.map((k, i) => (k === null ? i : null)).filter(i => i !== null)} empty={unprocessed === 0 ? 'none, scan complete' : ''} tone="transparent" />
      </div>
      <output aria-label="Mismatch counts">{`type A ${step.counts?.typeA ?? 0}, type B ${step.counts?.typeB ?? 0}${scanning ? ' (counts so far)' : ''}; processed ${processed.length} of ${kinds.length}`}</output>
    </section>

    {step.mixedCost !== undefined && <section aria-label="Pair prices" style={{ display: 'grid', gap: 4 }}>
      <h3 style={{ margin: 0 }}>Pair prices</h3>
      <p style={{ margin: 0 }}>{`Mixed pair (one type A with one type B): min(swap ${run.input.swapCost}, 2 × flip ${run.input.flipCost}) = ${step.mixedCost}`}</p>
      <p style={{ margin: 0 }}>{`Same-type pair: min(2 × flip ${run.input.flipCost}, cross ${run.input.crossCost} + swap ${run.input.swapCost}) = ${step.sameCost}`}</p>
      <p style={{ margin: 0 }}>{`Single leftover mismatch: one flip = ${run.input.flipCost}`}</p>
    </section>}

    {tested.length > 0 && <section aria-label="Tested mixed-pair counts" style={{ overflowX: 'auto' }}>
      <h3 style={{ margin: 0 }}>Tested counts</h3>
      <table style={{ borderCollapse: 'collapse', fontSize: 13 }}>
        <thead><tr>
          <th scope="col" style={{ textAlign: 'left', padding: 4 }}>Mixed m</th>
          <th scope="col" style={{ padding: 4 }}>Left A</th>
          <th scope="col" style={{ padding: 4 }}>Left B</th>
          <th scope="col" style={{ padding: 4 }}>Mixed cost</th>
          <th scope="col" style={{ padding: 4 }}>A residue</th>
          <th scope="col" style={{ padding: 4 }}>B residue</th>
          <th scope="col" style={{ padding: 4 }}>Total</th>
        </tr></thead>
        <tbody>{tested.map(b => {
          const isWinner = winner && winner.mixed === b.mixed
          return <tr key={b.mixed} data-winner={isWinner ? 'true' : undefined} style={{ fontWeight: isWinner ? 700 : 400, outline: isWinner ? '2px solid currentColor' : 'none' }}>
            <td style={{ padding: 4 }}>{b.mixed}{isWinner ? ' (best)' : ''}</td>
            <td style={{ padding: 4, textAlign: 'center' }}>{b.a}</td>
            <td style={{ padding: 4, textAlign: 'center' }}>{b.b}</td>
            <td style={{ padding: 4, textAlign: 'center' }}>{b.mixedPart}</td>
            <td style={{ padding: 4, textAlign: 'center' }}>{`${b.aPairs} pairs + ${b.aSingle} single = ${b.aPart}`}</td>
            <td style={{ padding: 4, textAlign: 'center' }}>{`${b.bPairs} pairs + ${b.bSingle} single = ${b.bPart}`}</td>
            <td style={{ padding: 4, textAlign: 'center' }}>{b.total}</td>
          </tr>
        })}</tbody>
      </table>
    </section>}

    {winner && <section aria-label="Winning breakdown" style={{ display: 'grid', gap: 4 }}>
      <h3 style={{ margin: 0 }}>{step.phase === 'done' ? 'Result breakdown' : 'Best so far'}</h3>
      <p style={{ margin: 0 }}>{`${winner.mixed} mixed pair${winner.mixed === 1 ? '' : 's'}: ${winner.mixedPart}, type A residue ${winner.aPart}, type B residue ${winner.bPart}, total ${winner.total}.`}</p>
    </section>}
  </div>
}

