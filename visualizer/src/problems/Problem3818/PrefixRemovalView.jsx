import React from "react"
const cell = { display: 'grid', justifyItems: 'center', gap: 4, minWidth: 52 }
const box = (border, background, weight = 600) => ({
  minWidth: 46, padding: '6px 8px', borderRadius: 6, textAlign: 'center', fontWeight: weight,
  border: `2px solid ${border}`, background, color: 'inherit',
})

// Labels accompany colour: each index shows its role in words, and the boundary is a labelled bar.
export default function PrefixRemovalView({ run, step }) {
  const nums = run.input.nums
  const n = nums.length
  const s = step ?? {}
  const done = s.phase === 'done'
  const k = s.k ?? n - 1
  const provisional = !done

  const roleOf = i => {
    if (i < k) return done ? 'removed' : 'provisional-removed'
    return 'suffix'
  }
  const styleFor = (i) => {
    const role = roleOf(i)
    const isCompared = s.left === i || s.right === i
    if (role === 'removed') return box('#b45309', 'rgba(180,83,9,0.18)', 500)
    if (role === 'provisional-removed') return box('#b45309', 'transparent', 500)
    if (isCompared && s.verdict === 'violation') return box('#b91c1c', 'rgba(185,28,28,0.22)', 800)
    if (isCompared) return box('#0f766e', 'rgba(15,118,110,0.25)', 800)
    return box('#0f766e', 'rgba(15,118,110,0.08)')
  }
  const tagFor = i => {
    const role = roleOf(i)
    const isCompared = s.left === i || s.right === i
    if (role === 'removed') return 'removed prefix'
    if (role === 'provisional-removed') return 'provisional removal'
    if (isCompared) return s.verdict === 'violation' ? 'compared: stop' : 'compared'
    return 'retained suffix'
  }

  const verdictText = s.verdict === 'violation'
    ? `${s.leftValue} < ${s.rightValue} is FALSE, so the scan stops`
    : s.verdict === 'ok' ? `${s.leftValue} < ${s.rightValue} is TRUE, so the suffix grows left` : 'no comparison in this frame'

  return <section aria-label="Shortest removed prefix" style={{ display: 'grid', gap: 12 }}>
    <div role="group" aria-label="array with suffix boundary" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'flex-end' }}>
      {nums.map((value, i) => <React.Fragment key={i}>
        {i === k && k > 0 && <div aria-label={`removal boundary before index ${k}`} data-testid="boundary" style={{ alignSelf: 'stretch', width: 4, borderRadius: 2, background: provisional ? '#b45309' : '#0f766e' }} />}
        <div style={cell} data-index={i} data-role={roleOf(i)}>
          <span style={{ fontSize: 11, opacity: 0.7 }}>i={i}</span>
          <div style={styleFor(i)}>{value}</div>
          <span style={{ fontSize: 11 }}>{tagFor(i)}</span>
        </div>
      </React.Fragment>)}
    </div>
    <p data-testid="boundary-text" style={{ margin: 0, fontWeight: 600 }}>
      {done
        ? `Final: remove the first ${k} element${k === 1 ? '' : 's'} (removed prefix = indices 0..${k - 1}); keep the retained suffix = indices ${k}..${n - 1}.`
        : `Provisional: suffix starts at k = ${k}, so ${k} element${k === 1 ? '' : 's'} would be removed so far (provisional, may still change).`}
    </p>
    <p data-testid="comparison" style={{ margin: 0, fontSize: 14 }}>{s.left >= 0 ? `Compare nums[${s.left}] = ${s.leftValue} with nums[${s.right}] = ${s.rightValue}: ${verdictText}.` : verdictText}</p>
  </section>
}
