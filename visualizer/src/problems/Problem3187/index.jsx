import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import FenwickView from '../../components/shared/FenwickView'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Mark peaks', description: 'Store a peak flag at each position in the Fenwick tree.' },
    { id: 'count', label: 'Count range', description: 'Subtract two prefix sums to count peaks strictly inside.' },
    { id: 'update', label: 'Update value', description: 'Re-check the three positions around the change.' },
    { id: 'done', label: 'Complete', description: 'Report the answers in order.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"nums": [...], "queries": [[1, l, r] or [2, index, value], ...]}',
  url: 'https://leetcode.com/problems/peaks-in-array/',
  complexity: 'O(log n) per query with the Fenwick tree and O(1) peak rechecks per update. The visualization caps input at 12 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[3,1,4,2,5],"queries":[[2,2,4],[1,0,2],[1,0,4]]}' },
    { label: 'Example 2', input: '{"nums":[4,1,4,2,1,5],"queries":[[2,2,4],[1,0,2],[1,0,5]]}' },
  ],
}

export default function PeaksInArray() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="nums (peaks marked)" length={step.arr.length} active={step.query ? step.query[1] : -1}
      valueAt={i => step.arr[i]} roleAt={i => (step.flags[i] ? 'peak' : '')} />
    <FenwickView title="Peak marks by position" tree={step.tree} ops={step.ops} />
    <output aria-label="Answers">{`Answers: [${step.answers.join(', ')}]`}</output>
    <p>{step.message}</p>
  </>} renderReasoning={() => <>
    <p>A peak can only change when its value or a neighbour's value changes, so an update re-checks three positions.</p>
    <p>A range count is the sum of peak marks strictly between the bounds, which a Fenwick tree answers as a prefix difference.</p>
  </>} />
}
