import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1332',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s (JSON)',
  url: 'https://leetcode.com/problems/remove-palindromic-subsequences/',
  complexity: 'O(n) time for the mirror comparison and O(n) space for the character view.',
  examples: [
    { label: 'Palindrome', input: '{"s":"aabbaa"}' },
    { label: 'Mixed ends', input: '{"s":"bbaaab"}' },
    { label: 'Empty', input: '{"s":""}' },
  ],
}

const cell = { minWidth: 36, padding: '6px 8px', boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace', fontSize: 18 }

export default function RemovePalindromic() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { chars, left, right, mismatch } = step.snapshot
    return chars.length === 0 ? <p>The string is empty.</p> : <>
      <div role="img" aria-label="Characters of the string" style={{ display: 'flex', gap: 6 }}>
        {chars.map((ch, i) => {
          const pointed = i === left || i === right
          return <div key={i} style={{ ...cell,
            border: `${pointed ? 2 : 1}px solid ${pointed ? 'var(--text)' : 'var(--border)'}`,
            background: mismatch && pointed ? '#fecaca' : 'transparent', color: '#1c1917',
          }}><div>{ch}</div><small>{i === left ? 'left' : i === right ? 'right' : i}</small></div>
        })}
      </div>
      <p>{mismatch ? 'These ends differ, so the answer is 2.' : left === null ? 'Every mirrored pair matched.' : 'Comparing the two ends.'}</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Subsequences need not be contiguous:</strong> removing every a in one step and every b in another always works, so two is an upper bound.</p>
    <p><strong>One step is enough</strong> only when the whole string reads the same forwards and backwards.</p>
  </>} />
}
