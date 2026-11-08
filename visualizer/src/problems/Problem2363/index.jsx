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
    { label: 'Two items each', input: '{"items1":[[3,2],[6,4]],"items2":[[5,7],[3,1]]}' },
    { label: 'Own: two items each side', input: '{"items1":[[4,2],[7,1]],"items2":[[7,3],[4,5]]}' },
    { label: 'One item each', input: '{"items1":[[1,1]],"items2":[[1,1]]}' },
    { label: 'Same value in both lists', input: '{"items1":[[2,3],[5,3]],"items2":[[2,3],[5,3]]}' },
    { label: 'Largest lists, 10 items each', input: '{"items1":[[1000,100],[999,100],[998,100],[997,100],[996,100],[995,100],[994,100],[993,100],[992,100],[991,100]],"items2":[[1000,100],[998,100],[996,100],[994,100],[992,100],[990,100],[988,100],[986,100],[984,100],[982,100]]}' },
    { label: 'Long run: 10 items each', input: '{"items1":[[853,54],[234,87],[656,96],[216,95],[343,63],[43,56],[778,10],[236,91],[364,51],[457,98]],"items2":[[939,56],[246,35],[304,62],[471,37],[556,51],[882,26],[74,29],[929,70],[89,26],[679,53]]}' },
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
