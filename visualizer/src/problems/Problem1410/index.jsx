import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1410',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Text to decode',
  url: 'https://leetcode.com/problems/html-entity-parser/',
  complexity: 'O(n) time and O(n) output space: every character is examined a constant number of times.',
  examples: [
    { label: 'Escaped ampersand', input: '&amp;lt;' },
    { label: 'Mixed text', input: 'Tom &amp; Jerry &lt;3 &unknown;' },
    { label: 'Apostrophe', input: '&&apos;' },
  ],
}

const cell = { minWidth: 22, padding: '2px 4px', textAlign: 'center', fontFamily: 'monospace', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text)' }

// The original text, with the characters the current step reads outlined; the output is built beside it.
export default function AlgorithmPage() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { text, span, emitted } = step.snapshot
    const [from, to] = span || [-1, -1]
    return <>
      <div aria-label="Original text" style={{ display: 'flex', gap: 2, flexWrap: 'wrap', marginBottom: 10 }}>
        {[...text].map((ch, i) => {
          const inSpan = span && i >= from && i < to
          return <span key={i} style={{ ...cell, borderWidth: inSpan ? 2 : 1, borderColor: inSpan ? 'var(--primary)' : 'var(--border)', background: inSpan ? 'var(--surface2)' : 'transparent', fontWeight: inSpan ? 700 : 400 }}>{ch === ' ' ? ' ' : ch}</span>
        })}
      </div>
      <p style={{ color: 'var(--text)' }}>{span ? `Reading positions ${from} to ${to - 1}.` : 'Nothing read yet.'}</p>
      <p style={{ color: 'var(--text)' }}><strong>Output so far:</strong> <code>{emitted || '(empty)'}</code></p>
    </>
  }} renderReasoning={() => <>
    <p><strong>One pass over the original text.</strong> Supported entities are recognised only where they appear in the input.</p>
    <p><strong>No second pass.</strong> A decoded ampersand is written to the output and never examined again, so nested-looking entity text stays as written.</p>
  </>} />
}
