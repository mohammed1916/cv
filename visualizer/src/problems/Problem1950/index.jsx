import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1950',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON array of integers (e.g. [3,1,2])',
  url: 'https://leetcode.com/problems/maximum-of-minimum-values-in-all-subarrays/',
  complexity: 'O(n) time with two monotonic stacks and one spread pass. The visualization caps n at 12.',
  examples: [
    { label: 'Small mix', input: '[3,1,2]' },
    { label: 'Equal values', input: '[2,2,2]' },
  ],
}

export default function Problem1950Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => {
      const n = run.input.nums.length
      return <>
        <IndexedSequence label="Values" length={n} valueAt={i => run.input.nums[i]} active={step.i}
          roleAt={i => {
            if (!step.span) return ''
            const [from, to] = step.span
            if (i === from - 1) return 'l'
            if (i === to + 1) return 'r'
            if (i >= from && i <= to) return 'window'
            return ''
          }} />
        <table aria-label="Best minimum per window size" style={{ borderCollapse: 'collapse' }}>
          <thead><tr><th>Window size</th>{Array.from({ length: n }, (_, k) => <th key={k}>{k + 1}</th>)}</tr></thead>
          <tbody><tr><th>Best</th>{Array.from({ length: n }, (_, k) => <td key={k} style={{ border: '1px solid var(--border)', padding: '2px 6px', textAlign: 'center', background: step.best && step.best[k + 1] ? 'var(--surface2)' : 'transparent' }}>{step.best && step.best[k + 1] ? step.best[k + 1] : '·'}</td>)}</tr></tbody>
        </table>
        <p>Shaded window: the span where the current value is the smallest. The outlines l and r mark the nearest smaller values on either side.</p>
      </>
    }}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
