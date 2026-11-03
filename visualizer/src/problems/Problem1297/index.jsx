import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1297',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s, maxLetters, minSize and maxSize (JSON)',
  url: 'https://leetcode.com/problems/maximum-number-of-occurrences-of-a-substring/',
  complexity: 'O(n) time with a fixed window of minSize letters, and O(n) space for the counted substrings.',
  examples: [
    { label: 'Repeated pair', input: '{"s":"aabbaabbaa","maxLetters":2,"minSize":2,"maxSize":4}' },
    { label: 'Three letters', input: '{"s":"abcabcabc","maxLetters":2,"minSize":2,"maxSize":3}' },
    { label: 'Too many letters', input: '{"s":"abcdef","maxLetters":1,"minSize":2,"maxSize":3}' },
  ],
}

export default function MaxOccurrences() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { window, end, sub, distinct, maxLetters, minSize, best, counts } = step.snapshot
    return <>
      <p>Window of letters: {window.length === 0 ? 'empty' : window.map(([ch, c]) => `${ch}×${c}`).join(', ')} · distinct {distinct} of at most {maxLetters}</p>
      <p>Current text: <code>{sub ?? '—'}</code> (ends at position {end}; target length {minSize})</p>
      <table aria-label="Substring counts" style={{ fontFamily: 'monospace', borderCollapse: 'collapse' }}>
        <thead><tr><th>substring</th><th>count</th></tr></thead>
        <tbody>{counts.length === 0 ? <tr><td colSpan={2}>none yet</td></tr> : counts.map(([text, c]) => <tr key={text}><td>{text}</td><td>{c}</td></tr>)}</tbody>
      </table>
      <p>Best so far: {best}</p>
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Shortest length only:</strong> every valid longer substring contains a valid shortest-length substring at least as often, so only one length is counted.</p>
    <p><strong>Sliding window:</strong> each step adds one letter and drops one, so counting costs constant work per position.</p>
    <p>{step.message}</p>
  </>} />
}
