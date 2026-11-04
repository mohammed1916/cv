import DPDependencyView from '../../components/shared/DPDependencyView'
import IndexedSequence from '../../components/shared/IndexedSequence'

const chipStyle = (border, background) => ({
  minWidth: 40, textAlign: 'center', padding: '4px 6px', borderRadius: 6,
  color: 'var(--text)', border: `2px solid ${border}`, background,
})

// Sorted window split at the median, with each value's distance from it: those distances add up to the cost.
function Halves({ step }) {
  const median = step.median
  const distance = value => (median === null ? null : Math.abs(value - median))
  const chip = (value, key, isMedian) => <span key={key} data-role={isMedian ? 'median' : 'value'} style={{ display: 'inline-grid', gap: 2 }}>
    <span style={chipStyle(isMedian && median !== null ? 'var(--primary)' : 'var(--border)', isMedian && median !== null ? 'color-mix(in srgb, var(--primary) 22%, var(--surface2))' : 'var(--surface2)')}>{value}</span>
    <small style={{ textAlign: 'center', color: 'var(--text-muted)', minHeight: '1em' }}>{median === null ? ' ' : isMedian ? 'median' : `+${distance(value)}`}</small>
  </span>
  const lowTop = step.low.length - 1
  return <section aria-label="Window split at its median">
    <h3 style={{ fontSize: '.9rem', margin: '0 0 6px' }}>Window in sorted order, split into two halves</h3>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'flex-start' }}>
      <div data-half="low">
        <small style={{ color: 'var(--text-muted)' }}>low · sum {step.sumLow}</small>
        <div style={{ display: 'flex', gap: 4, minHeight: 34 }}>{step.low.map((value, i) => chip(value, i, i === lowTop))}</div>
      </div>
      <div aria-hidden="true" style={{ alignSelf: 'stretch', borderLeft: '2px dashed var(--border)' }} />
      <div data-half="high">
        <small style={{ color: 'var(--text-muted)' }}>high · sum {step.sumHigh}</small>
        <div style={{ display: 'flex', gap: 4, minHeight: 34 }}>{step.high.map((value, i) => chip(value, i, false))}</div>
      </div>
    </div>
    {step.price && <p style={{ margin: '8px 0 0' }}>
      <code>{step.median}×{step.low.length} − {step.sumLow}</code> = {step.price.raise} up, <code>{step.sumHigh} − {step.median}×{step.high.length}</code> = {step.price.lower} down, cost <strong>{step.price.total}</strong>
    </p>}
  </section>
}

export default function WindowDpView({ run, step }) {
  const { nums, x, k } = run.input
  const costLength = nums.length - x + 1
  const chosen = step.chosen ?? []
  const chosenAt = i => chosen.find(w => i >= w.start && i <= w.end)
  const candidate = i => step.start >= 0 && i >= step.start && i < step.start + x
  const inWindow = i => step.stage === 'window' && step.r >= 0 && i >= step.l && i <= step.r
  const numsLabel = step.stage === 'dp'
    ? chosen.length ? 'nums, with chosen windows and their new value' : 'nums, with the window this cell may end'
    : `nums, sliding a window of size ${x}`
  return <section aria-label="Window costs and DP" style={{ display: 'grid', gap: 14, color: 'var(--text)' }}>
    <IndexedSequence label={numsLabel} length={nums.length}
      active={step.stage === 'window' ? step.r : -1}
      valueAt={i => (chosenAt(i) ? `${nums[i]}→${chosenAt(i).median}` : nums[i])}
      roleAt={i => (chosenAt(i) ? 'written' : candidate(i) || inWindow(i) ? 'window' : '')} />
    {step.stage === 'window' && <Halves step={step} />}
    <IndexedSequence label="cost[start]: operations to level the window starting at start" length={costLength}
      valueAt={i => step.cost[i] ?? '·'}
      active={step.phase === 'cost' ? step.cost.length - 1 : -1}
      roleAt={i => (step.start === i ? 'window' : chosen.some(w => w.start === i) ? 'written' : '')} />
    {step.stage === 'dp' && <DPDependencyView title={`dp[j][i]: j windows among the first i values (k = ${k})`} shape="grid"
      values={step.values} target={step.target} sources={step.sources} why={step.why}
      recurrence={step.sources.length ? 'dp[j][i] = min(dp[j][i-1], dp[j-1][i-x] + cost[i-x])' : undefined}
      labels={{ rows: step.values.map((_, j) => `j=${j}`), columns: step.values[0].map((_, i) => `i=${i}`) }} />}
    {step.phase === 'done' && <output aria-label="Answer" style={{ border: '2px solid var(--success)', borderRadius: 6, padding: '6px 10px', background: 'var(--surface2)' }}>
      Fewest operations: <strong>{run.result}</strong>
    </output>}
  </section>
}
