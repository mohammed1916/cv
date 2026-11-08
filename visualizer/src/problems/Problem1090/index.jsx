import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Sort', description: 'Order the items by value, largest first.' },
    { id: 'take', label: 'Take', description: 'Add the item because its label is under the limit.' },
    { id: 'skip', label: 'Skip', description: 'Pass over the item because its label is full.' },
    { id: 'stop', label: 'Stop', description: 'Stop once num_wanted items are taken.' },
    { id: 'done', label: 'Complete', description: 'Report the largest total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with values, labels, num_wanted and use_limit (values up to 12 items)',
  url: 'https://leetcode.com/problems/largest-values-from-labels/',
  complexity: 'O(n log n) time for n items. The visualization caps items at 12.',
  examples: [
    { label: 'Example 1', input: '{"values":[5,4,3,2,1],"labels":[1,1,2,2,3],"num_wanted":3,"use_limit":1}' },
    { label: 'Example 2', input: '{"values":[9,8,8,7,6],"labels":[0,0,0,1,1],"num_wanted":3,"use_limit":1}' },
    { label: 'Single item', input: '{"values":[7],"labels":[0],"num_wanted":1,"use_limit":1}' },
    { label: 'Equal values tie on label', input: '{"values":[5,5,5,5],"labels":[1,2,1,2],"num_wanted":2,"use_limit":1}' },
    { label: 'Largest values and labels', input: '{"values":[100,100,100,0],"labels":[20,20,0,20],"num_wanted":2,"use_limit":2}' },
    { label: 'Long run: 12 items', input: '{"values":[91,12,17,64,52,16,40,45,91,92,63,66],"labels":[2,0,0,0,2,4,2,2,1,4,4,3],"num_wanted":6,"use_limit":2}' },
  ],
}

export default function LargestValuesFromLabels() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Items" length={run.input.values.length} valueAt={index => `${run.input.values[index]} (label ${run.input.labels[index]})`} active={step.index} />
    <output aria-label="Running total">{`Total ${step.total} from ${step.taken} of ${run.input.num_wanted} wanted items`}</output>
  </>} renderReasoning={() => <>
    <p>Sorting by value puts the best candidates first, so a greedy pass that respects each label limit is optimal.</p>
    <p>An item skipped for its label never frees room for a better choice later, because later items are smaller.</p>
  </>} />
}
