import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { DPTable } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Base cases', description: 'D(0) = 1 and D(1) = 0 seed the table.' },
    { id: 'fill', label: 'Fill cell', description: 'Each cell uses the two cells before it.' },
    { id: 'done', label: 'Answer', description: 'The last filled cell is the answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Array length n (JSON integer, 1–200)',
  url: 'https://leetcode.com/problems/find-the-derangement-of-an-array/',
  complexity: 'O(n) time and O(1) extra space; the trace keeps the whole row for display.',
  examples: [
    { label: 'Four items', input: '4' },
    { label: 'Two items', input: '2' },
    { label: 'Single item', input: '1' },
  ],
}

export default function Derangement() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <DPTable title="D(k) table" values={[step.row]} activeCell={step.phase === 'start' ? null : { row: 0, column: step.index }}
      relatedCells={step.phase === 'fill' ? [{ row: 0, column: step.index - 1 }, { row: 0, column: step.index - 2 }] : []}
      columnLabels={step.row.map((_, k) => k)} />
    <output aria-label="Current cell">D({step.index}) = {step.row[step.index]} · of {run.input} items</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why this recurrence:</strong> the first item goes to some other position j. Either j's item lands on the first spot (a swap that leaves D(i − 2) ways) or it does not (D(i − 1) ways), and i − 1 choices exist for j.</p>
  </>} />
}
