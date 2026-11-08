import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { DPTable } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'mark', label: 'Mark differences', description: 'Find the positions where the strings disagree.' },
    { id: 'position', label: 'Position', description: 'Update the carry table for this position.' },
    { id: 'done', label: 'Complete', description: 'Report the cheapest cost.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object {"s1": binary, "s2": binary, "x": integer}',
  url: 'https://leetcode.com/problems/apply-operations-to-make-two-strings-equal/',
  complexity: 'O(n) time with two carry states per position. The visualization caps input at 12 digits.',
  examples: [
    { label: 'Own case 1', input: '{"s1":"1100011000","s2":"0101001010","x":2}' },
    { label: 'Impossible', input: '{"s1": "10110", "s2": "00011", "x": 4}' },
    { label: "Equal one-digit strings", input: "{\"s1\":\"0\",\"s2\":\"0\",\"x\":1}" },
    { label: "Equal strings, no change needed", input: "{\"s1\":\"1111\",\"s2\":\"1111\",\"x\":3}" },
    { label: "Longest strings, opposite digits", input: "{\"s1\":\"111111111111\",\"s2\":\"000000000000\",\"x\":20}" },
    { label: "Long run: 12 digits", input: "{\"s1\":\"011101111111\",\"s2\":\"100000011001\",\"x\":7}" },
  ],
}

export default function ApplyOperationsTwoStrings() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Positions (s1 | s2)" length={run.input.s1.length} valueAt={i => `${run.input.s1[i]}|${run.input.s2[i]}`} active={step.index}
      roleAt={i => (run.input.s1[i] !== run.input.s2[i] ? 'differs' : '')} />
    {step.table.length > 0 && <DPTable title="Carry table (doubled cost)" values={step.table.map(row => row.map(v => (v === null ? '-' : v)))}
      rowLabels={step.table.map((_, j) => j)} columnLabels={['carry 0', 'carry 1']} activeCell={step.index >= 0 ? { row: step.index, column: 0 } : null} />}
    <output aria-label="Result">{step.result === null ? step.message : `Answer: ${step.result}`}</output>
  </>} renderReasoning={() => <>
    <p>A pair flip costs x and fixes any two mismatches. An adjacent flip costs 1 and moves a mismatch one step, so a chain of adjacent flips between two mismatches costs their distance.</p>
    <p>Each adjacent edge is used either zero or one time net, so the table records whether an open chain crosses into the next position.</p>
  </>} />
}
