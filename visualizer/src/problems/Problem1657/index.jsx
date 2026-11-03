import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1657',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with word1 and word2 (JSON)',
  url: 'https://leetcode.com/problems/determine-if-two-strings-are-close/',
  complexity: 'O(n + k log k) time, where n is the word length and k is at most 26 distinct letters; the tallies need O(1) extra space.',
  examples: [
    { label: 'Close pair', input: '{"word1":"banana","word2":"aaabbn"}' },
    { label: 'Same letters, different counts', input: '{"word1":"aaab","word2":"aabb"}' },
    { label: 'Different letters', input: '{"word1":"cat","word2":"dog"}' },
  ],
}

const cell = { padding: '4px 10px', border: '1px solid var(--border)', textAlign: 'center', fontFamily: 'monospace' }

export default function CloseStrings() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { table, sameLetters, sameFreq, freq1, freq2 } = step.snapshot
    const verdict = sameLetters === null ? 'Not decided yet'
      : sameLetters === false ? 'Letter sets differ'
      : sameFreq === null ? 'Letter sets match'
      : sameFreq ? 'Sorted counts match' : 'Sorted counts differ'
    return <>
      <p><strong>{run.result === null ? '' : run.result ? 'Result: close' : 'Result: not close'}</strong> · {verdict}</p>
      {table ? <table aria-label="Letter tallies" style={{ borderCollapse: 'collapse' }}>
        <thead><tr><th style={cell}>Letter</th><th style={cell}>word1</th><th style={cell}>word2</th></tr></thead>
        <tbody>{table.map(row => <tr key={row.letter}>
          <td style={cell}>{row.letter}</td><td style={cell}>{row.in1}</td><td style={cell}>{row.in2}</td>
        </tr>)}</tbody>
      </table> : <p>Tallies appear after the first pass.</p>}
      {freq1 && <p style={{ fontFamily: 'monospace' }}>Sorted counts: [{freq1.join(', ')}] and [{freq2.join(', ')}]</p>}
    </>
  }} renderReasoning={() => <>
    <p><strong>Two reversible moves:</strong> swapping positions never changes the letters or their counts. Exchanging every copy of two letters only relabels them, so the letter set is kept and the counts move between letters.</p>
    <p><strong>Two invariants:</strong> the same distinct letters must appear, and the multiset of counts must match. Matching both is enough because counts can be assigned to any letter set member.</p>
  </>} />
}
