import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '151',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Sentence (up to 60 printable characters)',
  url: 'https://leetcode.com/problems/reverse-words-in-a-string/',
  complexity: 'O(n) time and O(n) space: one scan collects the words, then one reversal and one join.',
  examples: [
    { label: 'Sample A', input: '  the sky  is blue ' },
    { label: 'One word', input: '   hello   ' },
    { label: 'Tight', input: 'one two three' },
  ],
}

export default function ReverseWordsInAString() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { i, current, words, result } = step.snapshot
    return <>
      <div role="img" aria-label="Characters" style={{ display: 'flex', gap: 2, flexWrap: 'wrap', fontFamily: 'monospace' }}>
        {[...run.input].map((ch, p) => <span key={p} style={{
          minWidth: 14, textAlign: 'center', whiteSpace: 'pre',
          borderBottom: `${p === i ? 3 : 0}px solid var(--text)`,
          background: current && p >= i && p < i + current.length ? '#bbf7d0' : 'transparent',
        }}>{ch === ' ' ? '·' : ch}</span>)}
      </div>
      <p>Words: {words.length === 0 ? 'none yet' : words.map((w, n) => <span key={n} style={{ fontFamily: 'monospace', marginRight: 8 }}>[{w}]</span>)}</p>
      {result !== undefined && <p>Result: <code>{result}</code></p>}
    </>
  }} renderReasoning={() => <>
    <p><strong>Split by spaces by hand.</strong> Skip runs of spaces and collect each maximal run of other characters as a word. This avoids empty words without calling a split helper.</p>
    <p><strong>Reverse, then join.</strong> Reversing the list of words and joining with one space gives the required order and spacing.</p>
  </>} />
}
