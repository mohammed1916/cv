import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1405',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Letter budgets as a JSON object',
  url: 'https://leetcode.com/problems/longest-happy-string/',
  complexity: 'O(n) rounds for n output letters, with a fixed three-letter check each round. O(n) extra space for the output.',
  examples: [
    { label: 'Balanced', input: '{"a": 2, "b": 2, "c": 1}' },
    { label: 'One dominant', input: '{"a": 1, "b": 1, "c": 7}' },
    { label: 'Single letter', input: '{"a": 0, "b": 0, "c": 4}' },
  ],
}

const cell = { minWidth: 36, padding: '4px 6px', textAlign: 'center', fontFamily: 'monospace', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text)' }

export default function LongestHappyString() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { result, remaining, order, candidate } = step.snapshot
    return <>
      <div role="img" aria-label="Output so far" style={{ display: 'flex', gap: 4, flexWrap: 'wrap', minHeight: 40 }}>
        {[...result].map((letter, i) => <div key={i} style={cell}>{letter}</div>)}
        {result.length === 0 && <span>Nothing appended yet.</span>}
      </div>
      <p>Remaining: a={remaining.a}, b={remaining.b}, c={remaining.c}</p>
      {order && <p>Try order: {order.join(' › ')}{candidate ? ` · latest candidate ${candidate}` : ''}</p>}
    </>
  }} renderReasoning={() => <>
    <p><strong>Most copies first:</strong> the letter with the largest remaining budget is the one most at risk of running out, so it is tried first.</p>
    <p><strong>Break runs:</strong> when that letter would make three in a row, the next letter is used instead, which resets the run without wasting the big budget.</p>
  </>} />
}
