import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1309',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Digit string with # markers',
  url: 'https://leetcode.com/problems/decrypt-string-from-alphabet-to-integer-mapping/',
  complexity: 'O(n) time and O(n) space for a string of n characters.',
  examples: [
    { label: 'Pair then single', input: '12#3' },
    { label: 'Pair at the start', input: '10#1' },
    { label: 'Two pairs', input: '25#15' },
  ],
}

export default function Decrypt() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { s, at, group, letters } = step.snapshot
    return <>
      <div aria-label="Encoded string" style={{ display: 'flex', gap: 4, fontFamily: 'monospace' }}>
        {[...s].map((ch, i) => <span key={i} style={{
          padding: '2px 6px', border: '1px solid var(--border)',
          background: group && i >= group[0] && i < group[1] ? 'var(--surface2)' : 'transparent',
          fontWeight: i === at ? 700 : 400,
        }}>{ch}</span>)}
      </div>
      <p aria-label="Letters so far">Letters found so far: {letters.join('') || 'none yet'}</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Read from the right:</strong> a # always closes a two-digit group, so scanning right to left never needs to guess where a group starts.</p>
    <p><strong>Two-digit letters:</strong> 10 to 26 map to j to z. A single digit 1 to 9 maps to a to i.</p>
  </>} />
}
