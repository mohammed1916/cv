import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { DPTable } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'No pair is settled yet.' },
    { id: 'delete', label: 'Delete column', description: 'The column would unsort a tied pair.' },
    { id: 'keep', label: 'Keep column', description: 'Keep the column and settle pairs it strictly orders.' },
    { id: 'done', label: 'Complete', description: 'Return the number of deleted columns.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'strs (JSON array of equal-length strings)',
  url: 'https://leetcode.com/problems/delete-columns-to-make-sorted-ii/',
  complexity: 'O(n * m) time, O(n) space. The visualization caps input at 10 strings of length 12.',
  examples: [
    { label: 'Example 1', input: '["ca","bb","ac"]' },
    { label: 'Example 2', input: '["xc","yb","za"]' },
    { label: 'Example 3', input: '["zyx","wvu","tsr"]' },
  ],
}

export default function DeleteColumnsII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const m = run.input[0].length
    const labels = Array.from({ length: m }, (_, c) => step.deleted.includes(c) ? `${c} X` : String(c))
    const related = step.col >= 0 ? run.input.map((_, r) => ({ row: r, column: step.col })) : []
    return <>
      <DPTable title="Columns (X = deleted)" values={run.input.map(s => [...s])} columnLabels={labels} relatedCells={related}
        activeCell={step.bad >= 0 ? { row: step.bad, column: step.col } : null} />
      <IndexedSequence label="Adjacent pair settled?" length={step.settled.length} valueAt={i => (step.settled[i] ? 'yes' : 'tied')} active={step.bad}
        roleAt={i => step.settled[i] ? 'match' : ''} />
      <output aria-label="Deleted">Deleted so far: {step.deleted.length}</output>
    </>
  }} renderReasoning={() => <>
    <p>The strings are sorted when every adjacent pair is. Only columns that are not yet decided by earlier kept columns matter for a pair.</p>
    <p>If a column unsorts a still-tied pair, it must be deleted (keeping it can never help). Otherwise it is safe to keep, and any pair it strictly orders no longer needs checking.</p>
  </>} />
}
