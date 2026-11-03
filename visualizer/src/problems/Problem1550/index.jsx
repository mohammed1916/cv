import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const cell = { minWidth: 36, textAlign: 'center', border: '1px solid var(--border)', padding: 4, fontFamily: 'monospace' }

const definition = {
  number: '1550',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array of integers (JSON)',
  url: 'https://leetcode.com/problems/three-consecutive-odds/',
  complexity: 'O(n) time and O(1) extra space.',
  examples: [
    { label: 'Late run', input: '[2,6,4,1,3,5,7]' },
    { label: 'Broken run', input: '[1,2,3,4,5]' },
    { label: 'Negative odds', input: '[-3,-5,-7]' },
  ],
}

export default function ThreeConsecutiveOdds() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const arr = run.input
    const { index, odd, run: length } = step.snapshot
    return <>
      <div aria-label="Values" style={{ display: 'flex', gap: 6 }}>
        {arr.map((v, i) => <div key={i} style={{ ...cell, background: i === index ? 'var(--surface2)' : 'transparent', borderWidth: i === index ? 2 : 1, color: odd === true ? 'var(--text)' : undefined }}>{v}</div>)}
      </div>
      <p>Current run of odd values: <strong>{length}</strong> of 3 needed</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Key idea:</strong> a single pass tracks how many odd values end at the current position. Any even value resets that count.</p>
    <p>The answer is true as soon as the count reaches three, so the scan can stop early.</p>
  </>} />
}
