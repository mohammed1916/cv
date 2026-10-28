import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import HashMapView from '../../components/shared/HashMapView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty totals', description: 'No value has a total yet.' },
    { id: 'add', label: 'Add weight', description: 'Add this item’s weight to its value’s total.' },
    { id: 'done', label: 'Sorted result', description: 'Return the totals in increasing value order.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Two item lists as JSON: {"items1": [[value, weight], ...], "items2": [...]}',
  url: 'https://leetcode.com/problems/merge-similar-items/',
  complexity: 'O((n + m) log(n + m)) time for the final sort, with O(n + m) space for the totals. The visualization caps each list at 10 items.',
  examples: [
    { label: 'Example 1', input: '{"items1":[[1,1],[4,5],[3,8]],"items2":[[3,1],[1,5]]}' },
    { label: 'Example 2', input: '{"items1":[[1,1],[3,2],[2,3]],"items2":[[2,1],[3,2]]}' },
  ],
}

export default function MergeSimilarItems() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <HashMapView maps={step.maps} ops={step.ops} />
    <output aria-label="Merged items">{step.result.length ? `Merged: ${step.result.map(([v, w]) => `[${v}, ${w}]`).join(' ')}` : 'Merged list not ready yet'}</output>
  </>} renderReasoning={() => <>
    <p>Items with the same value are the same kind of item, so their weights add. A hash map keyed by value does this in one pass over both lists.</p>
    <p>The totals are then read out in increasing value order, which is the required output order.</p>
  </>} />
}
