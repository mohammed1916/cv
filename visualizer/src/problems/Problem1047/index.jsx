import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { phases, parseInput, buildTrace, code, python } from './algorithm'

const definition = {
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Lowercase letters, such as mnoonpq',
  url: 'https://leetcode.com/problems/remove-all-adjacent-duplicates-in-string/',
  complexity: 'O(n) time and O(n) space: each character is pushed and popped at most once.',
  examples: [
    { label: 'Exposed pair', input: 'mnoonpq' },
    { label: 'Full cancel', input: 'xxyyzz' },
    { label: 'No duplicates', input: 'abcde' },
    { label: 'Single letter', input: 'a' },
    { label: 'Nested pairs collapse', input: 'abba' },
    { label: 'Longest input, no repeats', input: 'abcdefghijklmnopqrst' },
    { label: 'Long run: 20 letters', input: 'aacbaccbabbabccababa' },
  ],
}

function Stack({ step }) {
  const { stack, c } = step.snapshot
  return <div>
    <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: 4, minHeight: 40, width: 'max-content' }}>
      {stack.length === 0 && <span style={{ color: 'var(--text-dim)' }}>empty stack</span>}
      {stack.map((ch, index) => <div key={index} data-stack={ch} style={{
        padding: '4px 12px', fontFamily: 'monospace', color: 'var(--text)',
        border: `${index === stack.length - 1 ? 2 : 1}px solid ${index === stack.length - 1 ? 'var(--primary)' : 'var(--border)'}`,
        background: 'var(--surface2)',
      }}>{ch}</div>)}
    </div>
    {c !== null && <p aria-label="Current character">{`Current character: ${c}`}</p>}
  </div>
}

export default function RemoveDuplicatesWorkspace() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ step }) => <Stack step={step} />}
    renderReasoning={({ step }) => <>
      <p>{step.message}</p>
      <p>The stack always holds the reduced prefix. A new character can only cancel against the top, so one pass with a stack removes every adjacent pair, including pairs exposed by earlier removals.</p>
    </>}
  />
}
