import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

function OperationChips({ s, active }) {
  return <ol aria-label="Operations, read from the last to the first" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', listStyle: 'none', padding: 0 }}>
    {[...String(s)].map((op, i) => <li key={i} data-current={i === active ? 'yes' : undefined}
      style={{ border: '1px solid var(--surface2)', borderRadius: 6, padding: '4px 8px', background: i === active ? 'var(--primary)' : 'var(--surface2)', color: i === active ? 'var(--on-primary, #fff)' : 'var(--text)' }}>
      <small>{i + 1}</small> <strong>{op}</strong>
    </li>)}
  </ol>
}

const definition = {
  phases: [
    { id: 'lengths', label: 'Lengths', description: 'Track only the length after each operation.' },
    { id: 'back', label: 'Walk back', description: 'Map the position back through each operation, last to first.' },
    { id: 'found', label: 'Found', description: 'The walked-back position is a letter that was appended.' },
    { id: 'done', label: 'Complete', description: 'Report the character, or a dot if k is out of range.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with s (letters, *, # and %) and k',
  url: 'https://leetcode.com/problems/process-string-with-special-operations-ii/',
  complexity: 'O(length of s) time, with no string built. The visualization caps the final string at 5000 characters.',
  examples: [
    { label: 'Example 1', input: '{"s":"cd%*#","k":2}' },
    { label: 'Example 2', input: '{"s":"ab#","k":3}' },
  ],
}

export default function SpecialOperationsII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <OperationChips s={run.input.s} active={step.index} />
    <output aria-label="Position">{`Operations: ${run.input.s}. Position ${step.pos} of ${step.total} (operation ${step.index >= 0 ? step.index + 1 : '-'})`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>The final string is never built. Each reversal maps a position to its mirror image, and each copy maps a position in the second half back into the first half.</p>
  </>} />
}
