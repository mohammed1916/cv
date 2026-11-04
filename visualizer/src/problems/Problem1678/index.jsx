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

// Split the command into whole tokens so each token is drawn as one block.
function tokenize(command) {
  return command.match(/\(al\)|\(\)|G/g) || []
}

const TOKEN_OUTPUT = { G: 'G', '()': 'o', '(al)': 'al' }

const chip = (active, done) => ({
  display: 'inline-flex', flexDirection: 'column', alignItems: 'center', minWidth: 44, padding: '6px 10px',
  borderRadius: 8, border: `2px solid ${active ? 'var(--primary)' : 'var(--border, var(--surface2))'}`,
  background: active ? 'var(--primary)' : done ? 'var(--surface2)' : 'var(--surface)',
  color: active ? 'var(--on-primary, #fff)' : 'var(--text)', fontFamily: 'monospace', fontSize: 14,
})

export default function GoalParser() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { index, output, token } = step.snapshot
    const tokens = tokenize(run.input)
    // Map each token to its starting character position.
    let pos = 0
    const starts = tokens.map(t => { const s = pos; pos += t.length; return s })
    const currentIndex = token ? starts.findIndex((s, k) => s === index && tokens[k] === token) : -1
    return <>
      <p style={{ color: 'var(--text-muted, var(--text))', margin: '0 0 6px' }}>Read the command left to right. The token at the current position decides the text.</p>
      <div role="img" aria-label="Command tokens" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
        {tokens.map((t, k) => <div key={k} style={chip(k === currentIndex, starts[k] < index)}>
          <span>{t}</span>
          <small style={{ opacity: 0.8 }}>→ {TOKEN_OUTPUT[t]}</small>
        </div>)}
      </div>
      <p>Position: <code>{index}</code> of {run.input.length}</p>
      <p>Current token: <code>{token ?? '-'}</code></p>
      <p>Output so far: <strong style={{ fontFamily: 'monospace' }}>{output || '(empty)'}</strong></p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Longest match first:</strong> the position decides the token. A "(" always starts either "()" or "(al)", so the next two characters tell them apart.</p>
    <p><strong>Advance by length:</strong> each token moves the position by its own length, so no character is read twice.</p>
  </>} />
}
