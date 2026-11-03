import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1678',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Command as a JSON string of G, (), and (al) tokens',
  url: 'https://leetcode.com/problems/goal-parser-interpretation/',
  complexity: 'O(n) time and O(n) output: each character is read once, and multi-character tokens skip ahead.',
  examples: [
    { label: 'Mixed', input: '"()G(al)G"' },
    { label: 'Ends with ()', input: '"G(al)()"' },
    { label: 'Only al', input: '"(al)"' },
  ],
}

export default function GoalParser() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { index, output, token } = step.snapshot
    return <>
      <div role="img" aria-label="Command characters" style={{ fontFamily: 'monospace', fontSize: 20, letterSpacing: 2 }}>
        {[...run.input].map((ch, i) => <span key={i} style={{ fontWeight: i === index ? 700 : 400, textDecoration: i === index ? 'underline' : 'none' }}>{ch}</span>)}
      </div>
      <p>Current token: <code>{token ?? '-'}</code></p>
      <p>Output so far: <strong>{output || '(empty)'}</strong></p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Longest match first:</strong> the position decides the token. A "(" always starts either "()" or "(al)", so the next two characters tell them apart.</p>
    <p><strong>Advance by length:</strong> each token moves the position by its own length, so no character is read twice.</p>
  </>} />
}
