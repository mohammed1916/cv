import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1689',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Positive whole number (digits only)',
  url: 'https://leetcode.com/problems/partitioning-into-minimum-number-of-deci-binary-numbers/',
  complexity: 'O(d) time for d digits and O(1) extra space.',
  examples: [
    { label: 'Mixed digits', input: '2046' },
    { label: 'Single digit', input: '5' },
    { label: 'Long run', input: '90000' },
  ],
}

export default function DeciBinary() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { digits, index, best, layers } = step.snapshot
    return <>
      <div role="img" aria-label="Digits of n" style={{ display: 'flex', gap: 6 }}>
        {digits.split('').map((ch, i) => <div key={i} style={{ padding: '6px 9px', fontFamily: 'monospace', border: `${i === index ? 2 : 1}px solid ${i === index ? 'var(--text)' : 'var(--border)'}` }}>{ch}</div>)}
      </div>
      <p>Best digit so far: {best}{run.result === best && layers ? ` · ${layers.length} layers` : ''}</p>
      {layers && <ul aria-label="Deci-binary layers" style={{ fontFamily: 'monospace' }}>{layers.map((row, i) => <li key={i}>{row}</li>)}</ul>}
    </>
  }} renderReasoning={({ run }) => <>
    <p><strong>Key idea:</strong> a deci-binary number has only 0 and 1 digits, so at each place value one of them contributes at most 1. Covering a digit d needs d such numbers.</p>
    <p><strong>Answer:</strong> the largest digit of {run.input}. The layers shown above add back up to the original number.</p>
  </>} />
}
