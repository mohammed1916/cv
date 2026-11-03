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

export default function HtmlEntityParser() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { text, span, emitted } = step.snapshot
    return <>
      <p aria-label="Original text">
        {[...text].map((ch, i) => <span key={i} style={{
          fontFamily: 'monospace', padding: '2px 1px',
          background: span && i >= span[0] && i < span[1] ? '#cffafe' : undefined,
          fontWeight: span && i >= span[0] && i < span[1] ? 700 : 400,
        }}>{ch === ' ' ? ' ' : ch}</span>)}
      </p>
      <p><strong>Output so far:</strong> <code>{emitted || '(empty)'}</code></p>
    </>
  }} renderReasoning={() => <>
    <p><strong>One pass over the original text.</strong> Supported entities are recognised only where they appear in the input.</p>
    <p><strong>No second pass.</strong> A decoded ampersand is written to the output and never examined again, so nested-looking entity text stays as written.</p>
  </>} />
}
