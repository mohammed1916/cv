import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1431',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with candies and extraCandies (JSON)',
  url: 'https://leetcode.com/problems/kids-with-the-greatest-number-of-candies/',
  complexity: 'O(n) time and O(n) output: one maximum scan, then one comparison per child.',
  examples: [
    { label: 'Clear leader', input: '{"candies":[2,3,5,1,3],"extraCandies":3}' },
    { label: 'Tie at the top', input: '{"candies":[5,5,3],"extraCandies":0}' },
    { label: 'Large bonus', input: '{"candies":[12,1,12],"extraCandies":10}' },
  ],
}

const bar = { display: 'grid', gridTemplateColumns: '44px 1fr 56px', gap: 8, alignItems: 'center', color: 'var(--text)', fontFamily: 'monospace', fontSize: 13 }

export default function KidsWithGreatestCandies() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { candies, extraCandies } = run.input
    const { current, best, flags = [] } = step.snapshot
    const max = Math.max(1, ...candies.map(c => c + extraCandies))
    const pct = v => `${(v / max) * 100}%`
    return <>
      <p style={{ color: 'var(--text)' }}>Extra candies: {extraCandies}. Greatest original count: <strong>{best}</strong>. A child is flagged when their count plus extra reaches {best}.</p>
      <div role="img" aria-label="Candies per child with the extra added" style={{ display: 'grid', gap: 6, marginBottom: 10 }}>
        {candies.map((count, i) => {
          const isCurrent = i === current
          const flagged = i < flags.length ? flags[i] : null
          return <div key={i} style={{ ...bar, opacity: current !== null && i > current ? 0.5 : 1 }}>
            <span>child {i}</span>
            <div style={{ position: 'relative', height: 16, borderRadius: 4, background: 'var(--surface2)', border: '1px solid var(--border)' }}>
              <div style={{ width: pct(count), height: '100%', background: 'var(--text)', opacity: 0.35, borderRadius: 4 }} />
              <div style={{ position: 'absolute', top: -3, bottom: -3, left: pct(count + extraCandies), width: 3, background: isCurrent ? 'var(--primary)' : 'var(--text)' }} />
              <div style={{ position: 'absolute', top: -6, bottom: -6, left: pct(best), width: 2, background: 'var(--primary)', opacity: 0.6 }} />
            </div>
            <span>{count}{flagged === null ? '' : flagged ? ' yes' : ' no'}</span>
          </div>
        })}
      </div>
      <p style={{ color: 'var(--text)' }}>Bars show the original count; the tick is the count after the extra candies. The dashed-style line marks the greatest count {best}.</p>
      <p style={{ color: 'var(--text)' }}>{step.message}</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>One target:</strong> every child is compared against the same number, the greatest count, so the largest value is found once.</p>
    <p><strong>Extra is added first:</strong> the test is count plus extra compared with the largest count, not the largest count plus extra.</p>
  </>} />
}
