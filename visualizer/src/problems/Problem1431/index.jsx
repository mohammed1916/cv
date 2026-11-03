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

export default function KidsWithGreatestCandies() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { candies, extraCandies } = run.input
    const { current, best, flags } = step.snapshot
    return <>
      <div role="img" aria-label="Children with candy counts and flags" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {candies.map((count, i) => {
          const flag = flags[i]
          return <div key={i} data-index={i} style={{
            minWidth: 72, padding: '6px 8px', boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace',
            border: `${i === current ? 2 : 1}px solid ${i === current ? 'var(--text)' : 'var(--border)'}`,
            background: flag === undefined ? 'transparent' : flag ? '#bbf7d0' : '#fecaca', color: '#1c1917',
          }}><div>{count}{current === i && step.snapshot.total !== undefined ? ` + ${extraCandies} = ${step.snapshot.total}` : ''}</div><small>child {i}</small></div>
        })}
      </div>
      <p>Greatest original count: <strong>{best}</strong>. Flags so far: {flags.length ? flags.map(f => (f ? 'true' : 'false')).join(', ') : 'none'}</p>
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Hypothetical bonus:</strong> only one child receives the extra candies at a time, so every test is independent.</p>
    <p><strong>Ties count:</strong> reaching the maximum is enough, which is why the comparison is greater than or equal to.</p>
  </>} />
}
