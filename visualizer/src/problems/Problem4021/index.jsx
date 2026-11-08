import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'rotate', label: 'Rotation', description: 'Try one rotation and price each mirror pair.' },
    { id: 'done', label: 'Complete', description: 'Report the cheapest rotation.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'String (JSON object with s)',
  url: 'https://leetcode.com/problems/minimum-operations-to-make-a-rotated-palindrome-i/',
  complexity: 'O(n²) time and O(n) space for each rotation. The visualization caps s at 12 letters.',
  examples: [
    { label: 'Example 1', input: '{"s":"abc"}' },
    { label: 'Example 2', input: '{"s":"yb"}' },
    { label: "Two equal letters", input: "{\"s\":\"aa\"}" },
    { label: "Longest repeated run", input: "{\"s\":\"zzzzzzzzzzzz\"}" },
    { label: "Mirror pattern", input: "{\"s\":\"abcba\"}" },
    { label: "Long run: 12 letters", input: "{\"s\":\"cxbedtskdrbi\"}" },
  ],
}

export default function RotatedPalindromeOperations() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label={`Rotation ${step.r >= 0 ? step.r : '-'}: ${step.text} (l and r are the mirror pair being priced)`} length={step.text.length}
      active={step.pair ? step.pair[0] : -1} valueAt={i => step.text[i]}
      roleAt={i => (step.pair && i === step.pair[0] ? 'l' : step.pair && i === step.pair[1] ? 'r' : '')} />
    <table aria-label="Cost per rotation">
      <thead><tr><th>rotation</th><th>string</th><th>cost</th></tr></thead>
      <tbody>{step.table.map(row => <tr key={row.r} data-current={row.r === step.r ? 'yes' : undefined}>
        <td>{row.r}</td><td>{row.text}</td><td>{row.cost}</td></tr>)}</tbody>
    </table>
    <output aria-label="Best">{`Original ${run.input.s}; best so far ${step.best ?? '(none)'}. ${step.message}`}</output>
  </>} renderReasoning={() => <>
    <p>A left rotation costs one operation, and a letter can only move forward through the alphabet, so each mirror pair costs the smaller of the two forward distances.</p>
    <p>The answer is the cheapest total over all rotations.</p>
  </>} />
}
