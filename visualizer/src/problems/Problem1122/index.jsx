import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { phases, parseInput, buildTrace, code, python } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Two arrays (JSON object with arr1 and arr2)',
  url: 'https://leetcode.com/problems/relative-sort-array/',
  complexity: 'O(n + m) time for counting and placing, where m is the largest value (30 here).',
  examples: [
    { label: 'Mixed', input: '{"arr1":[4,2,9,2,7,4,1],"arr2":[2,4,1]}' },
    { label: 'Every value listed', input: '{"arr1":[5,5,5],"arr2":[5]}' },
    { label: 'One listed', input: '{"arr1":[8,3,6],"arr2":[3]}' },
  ],
}

export default function RelativeSort() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => {
      const s = step.snapshot
      return <div style={{ display: 'grid', gap: 12 }}>
        <div><strong>Listed order:</strong> {s.listed.map(v => <span key={v} style={{ marginRight: 6, fontWeight: v === s.current ? 700 : 400 }}>{v}</span>)}</div>
        <div><strong>Remaining counts:</strong> {s.counts.filter(c => c.count > 0).map(c => `${c.value}×${c.count}`).join('  ') || 'none'}</div>
        <div aria-label="Result"><strong>Result:</strong> {s.result.length ? s.result.map((v, i) => <span key={i} style={{ marginRight: 4 }}>{v}</span>) : 'empty'}</div>
      </div>
    }}
    renderReasoning={({ step }) => <p>{step.snapshot.current === null || step.phase === 'count' || step.phase === 'start'
      ? 'Counting removes the need to compare every pair. Each value is then written in a single block.'
      : 'Values listed in arr2 come first, in arr2 order. Leftover values are placed in ascending order after them.'}</p>} />
}
