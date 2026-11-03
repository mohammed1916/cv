import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { phases, parseInput, buildTrace, code, python } from './algorithm'

const definition = {
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Stone weights as a JSON array, such as [5,3,9,4]',
  url: 'https://leetcode.com/problems/last-stone-weight-ii/',
  complexity: 'O(n * S) time and O(S) space, where S is the total weight. The table only covers sums up to half the total.',
  examples: [
    { label: 'Uneven split', input: '[5,3,9,4]' },
    { label: 'Perfect split', input: '[10,10]' },
    { label: 'Single stone', input: '[8]' },
  ],
}

function Sums({ step }) {
  const { reachable, half, best } = step.snapshot
  return <div>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
      {reachable.map((ok, t) => <div key={t} data-sum={t} style={{
        width: 34, padding: '4px 0', textAlign: 'center', fontFamily: 'monospace', color: 'var(--text)',
        border: `${best === t ? 2 : 1}px solid ${best === t ? '#0891b2' : 'var(--border)'}`,
        background: ok ? 'rgba(8,145,178,.25)' : 'transparent',
      }}>{t}</div>)}
    </div>
    <p aria-label="Half of the total">{`Sums are checked up to ${half}; shaded sums are reachable by some group.`}</p>
  </div>
}

export default function LastStoneTwoWorkspace() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <>
      <Sums step={step} />
      <output aria-label="Total weight">{`Total ${run.frames[0].snapshot.total}`}</output>
    </>}
    renderReasoning={({ step }) => <>
      <p>{step.message}</p>
      <p>Splitting the stones into two groups with sums A and B leaves a final weight of |A - B|. Choosing a group sum no larger than half the total and as large as possible minimises that difference.</p>
    </>}
  />
}
