import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'sort', label: 'Sort', description: 'Order the items by profit, largest first.' },
    { id: 'take', label: 'Take k', description: 'Take the first k items.' },
    { id: 'dup', label: 'Duplicates', description: 'Find chosen items that repeat a category.' },
    { id: 'best', label: 'Start score', description: 'Score the first k items.' },
    { id: 'skip', label: 'Skip', description: 'Skip items that add nothing new.' },
    { id: 'swap', label: 'Swap', description: 'Swap the weakest duplicate for a new category.' },
    { id: 'update', label: 'Update', description: 'Record the best elegance so far.' },
    { id: 'done', label: 'Complete', description: 'Report the maximum elegance.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with items ([profit, category] pairs) and k (JSON)',
  url: 'https://leetcode.com/problems/maximum-elegance-of-a-k-length-subsequence/',
  complexity: 'O(n log n) time for sorting, then one pass. The visualization caps n at 8.',
  examples: [
    { label: 'Example 1', input: '{"items":[[3,2],[5,1],[10,1]],"k":2}' },
    { label: 'Swap case', input: '{"items":[[5,1],[5,1],[3,2]],"k":2}' },
  ],
}

export default function MaximumElegance() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Items by profit (profit, category)" length={run.sorted.length}
      valueAt={i => `${run.sorted[i].profit}, cat ${run.sorted[i].category}`}
      active={step.cursor} roleAt={i => (step.chosen[i] ? 'chosen' : 'left out')} />
    <output aria-label="Elegance">{`Total profit ${step.total}, distinct ${step.distinct}, elegance ${step.total + step.distinct ** 2}, best ${step.best}`}</output>
  </>} renderReasoning={() => <>
    <p>Elegance is total profit plus the square of the distinct categories. Start with the k most profitable items, then trade a duplicate for an unused category whenever that raises the score.</p>
    <p>Each trade gives up the least profitable duplicate, because the chosen items are sorted and that one costs the least.</p>
  </>} />
}
