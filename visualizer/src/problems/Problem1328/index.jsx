import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1328',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with text (JSON)',
  url: 'https://leetcode.com/problems/break-a-palindrome/',
  complexity: 'O(n) time and O(n) space for a string of length n: one scan of the first half plus one copy.',
  examples: [
    { label: 'Early non-a', input: '{"text":"noon"}' },
    { label: 'All a', input: '{"text":"aaaa"}' },
    { label: 'Middle odd', input: '{"text":"level"}' },
  ],
}

const cell = { minWidth: 36, padding: '6px 8px', boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace', fontSize: 18 }

export default function BreakPalindrome() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { chars, index, changed, half } = step.snapshot
    return <>
      <div role="img" aria-label="Characters of the palindrome" style={{ display: 'flex', gap: 6 }}>
        {chars.map((ch, i) => <div key={i} style={{ ...cell,
          border: `${i === index || i === changed ? 2 : 1}px solid ${i === index ? 'var(--text)' : 'var(--border)'}`,
          background: i === changed ? '#bbf7d0' : i < half ? 'var(--surface2)' : 'transparent', color: '#1c1917',
        }}><div>{ch}</div><small>{i}</small></div>)}
      </div>
      <p>{changed !== null ? `Changed position ${changed}.` : index !== null ? `Checking position ${index}.` : 'Shaded cells form the first half.'}</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Break the first half:</strong> changing the earliest non-a character to a gives the smallest result, and the mirrored end keeps its old letter so symmetry is gone.</p>
    <p><strong>All a:</strong> the last character must change, and b is the smallest choice that is not a.</p>
  </>} />
}
