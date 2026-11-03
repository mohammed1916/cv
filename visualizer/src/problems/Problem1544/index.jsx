import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1544', phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Letter string',
  url: 'https://leetcode.com/problems/make-the-string-great/',
  complexity: 'O(n) time and O(n) space: each letter is pushed or popped at most once.',
  examples: [
    { label: 'Full cancel', input: 'abBAcC' },
    { label: 'Partial', input: 'xXyYzq' },
    { label: 'Nothing cancels', input: 'aBcD' },
  ],
}

export default function MakeStringGreat() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const s = run.input
    const { index, char, stack, top } = step.snapshot
    return <>
      <div role="img" aria-label="Input letters" style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {[...s].map((ch, i) => <span key={i} style={{
          padding: '4px 6px', fontFamily: 'monospace', color: 'var(--text)',
          border: `${i === index ? 2 : 1}px solid ${i === index ? 'var(--text)' : 'var(--border)'}`,
          opacity: index !== null && index !== undefined && i < index ? 0.5 : 1,
        }}>{ch}</span>)}
      </div>
      <p>{char ? `Current letter: ${char}. Stack top: ${top ?? 'empty'}.` : 'The stack starts empty.'}</p>
      <div role="img" aria-label="Stack" style={{ display: 'flex', flexDirection: 'column-reverse', gap: 4, minHeight: 40 }}>
        {stack.length === 0 ? <em>empty stack</em> : stack.map((ch, i) => <span key={i} style={{
          padding: '4px 8px', width: 'fit-content', fontFamily: 'monospace', color: 'var(--text)',
          border: `1px solid ${i === stack.length - 1 ? 'var(--text)' : 'var(--border)'}`,
        }}>{ch}</span>)}
      </div>
    </>
  }} renderReasoning={() => <>
    <p><strong>Only the top matters:</strong> a letter can cancel only the letter directly before it in the reduced prefix, so a stack is enough.</p>
    <p><strong>Cascading cancellations:</strong> after a pop, the new top may now cancel the next letter, which the loop handles naturally.</p>
  </>} />
}
