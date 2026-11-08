import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1404',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Binary digits as a JSON string',
  url: 'https://leetcode.com/problems/number-of-steps-to-reduce-a-number-in-binary-representation-to-one/',
  complexity: 'O(n) time for n binary digits, scanning each digit once. O(1) extra space for the counter and carry.',
  examples: [
    { label: 'Mixed bits', input: '"1101"' },
    { label: 'Two digits', input: '"11"' },
    { label: 'Power of two', input: '"1000"' },
    { label: "Single one", input: "\"1\"" },
    { label: "Carry chain", input: "\"111\"" },
    { label: "Longest, forty digits", input: "\"1111111111111111111111111111111111111111\"" },
    { label: "Long run: forty digits", input: "\"1110100111010001111111101110101011110000\"" },
  ],
}

const cell = { minWidth: 40, padding: 12, textAlign: 'center', fontFamily: 'monospace', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }

export default function ReduceBinaryToOne() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { bits, index, value, carry, steps } = step.snapshot
    return <>
      <div role="img" aria-label="Binary digits, least significant on the right" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {[...bits].map((digit, i) => <div key={i} style={{
          ...cell, borderWidth: i === index ? 2 : 1,
          background: i === index ? 'var(--surface2)' : 'transparent',
        }}><div>{digit}</div><small>{i}{i === index ? ' i' : ''}</small></div>)}
      </div>
      <p>Current digit: {index === null || index === undefined ? 'none' : `${index} (${bits[index]})`} · Carry: <strong>{carry}</strong> · Steps: <strong>{steps}</strong></p>
      {value !== null && value !== undefined && <p>Effective bit (digit plus carry): <strong>{value}</strong>, so the number is {value === 1 ? 'odd' : 'even'} at this point.</p>}
      <p>Input length: {run.input.length} digits.</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Work from the right:</strong> halving removes the lowest digit, and adding one to an odd number only changes the lowest digits, so a single carry is enough to track the process.</p>
    <p><strong>Leading one:</strong> the top digit is never divided, so the scan stops before it, and any leftover carry costs one final add.</p>
  </>} />
}
