import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with an integer n (JSON)',
  url: 'https://leetcode.com/problems/armstrong-number/',
  complexity: 'O(d) time for d digits and O(d) extra space for the digits. The visualization accepts n up to 100000000.',
  examples: [
    { label: 'Three digits', input: '{"n":153}' },
    { label: 'Not Armstrong', input: '{"n":10}' },
    { label: 'Four digits', input: '{"n":9474}' },
  ],
}

export default function ArmstrongNumber() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { digits, k, total, n, current } = step.snapshot
    return <>
      <div role="img" aria-label="Digits of n" style={{ display: 'flex', gap: 8, fontFamily: 'monospace' }}>
        {digits.map((d, i) => <div key={i} data-digit={i} style={{
          width: 48, height: 48, display: 'grid', placeItems: 'center', fontSize: '1.2rem',
          border: `${current === i ? 2 : 1}px solid ${current === i ? 'var(--text)' : 'var(--border)'}`,
          background: current !== null && i < current ? 'var(--surface2)' : 'transparent',
        }}>{d}</div>)}
      </div>
      <p>{k ? `Each digit is raised to the power ${k}.` : 'Digits will appear here.'}</p>
      <output aria-label="Running total">{`Total ${total} of target ${n}`}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Digit count sets the power:</strong> a number with k digits uses exponent k for every digit.</p>
    <p><strong>Compare at the end:</strong> the total of those powers is checked against n once every digit has been used.</p>
  </>} />
}
