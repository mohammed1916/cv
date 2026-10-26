import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { DPTable } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Borders', description: 'Empty prefixes cost the sum of the other side.' },
    { id: 'match', label: 'Match', description: 'Equal characters are kept at no cost.' },
    { id: 'choose', label: 'Delete cheaper', description: 'Delete whichever character has the smaller code.' },
    { id: 'done', label: 'Complete', description: 'Return the cell for both full strings.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Strings (JSON object with s1 and s2)',
  url: 'https://leetcode.com/problems/minimum-ascii-delete-sum-for-two-strings/',
  complexity: 'O(n · m) time and O(n · m) space for the table.',
  examples: [
    { label: 'Sample', input: '{"s1":"sea","s2":"eat"}' },
    { label: 'Delete all', input: '{"s1":"delete","s2":"leet"}' },
  ],
}

export default function MinAsciiDeleteSum() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <DPTable title="Least delete cost for prefixes" values={step.table}
      rowLabels={['', ...run.input.s1.split('')]} columnLabels={['', ...run.input.s2.split('')]}
      activeCell={{ row: step.row, column: step.column }} />
    <output aria-label="Cost">{step.phase === 'done' ? `Cost: ${step.result}` : step.message}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why ASCII cost:</strong> deleting a character costs its code, so deleting the smaller-code character from a mismatch is cheaper.</p>
  </>} />
}
