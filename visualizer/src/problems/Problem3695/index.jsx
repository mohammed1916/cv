import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Every index begins in its own group.' },
    { id: 'join', label: 'Join', description: 'Each swap joins the groups of its two indices.' },
    { id: 'group', label: 'Group', description: 'Place the largest values of each group on the even indices.' },
    { id: 'done', label: 'Complete', description: 'Report the best alternating sum.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums and swaps (JSON), for example {"nums":[1,2,3],"swaps":[[0,2],[1,2]]}',
  url: 'https://leetcode.com/problems/maximize-alternating-sum-using-swaps/',
  complexity: 'O(n log n) time for sorting the groups. The visualization caps nums at 10 values and swaps at 12 pairs.',
  examples: [
    { label: 'Own case 1', input: '{"nums":[3,2,1],"swaps":[[1,2],[0,2]]}' },
    { label: 'Own case 2', input: '{"nums":[3,2,1],"swaps":[[1,2]]}' },
    { label: 'Example 3', input: '{"nums":[1,99,1,99,1,99],"swaps":[]}' },
    { label: 'Two values no swap', input: '{"nums":[4,8],"swaps":[]}' },
    { label: 'Equal values tie', input: '{"nums":[5,5,5],"swaps":[[0,1]]}' },
    { label: 'Alternating extremes', input: '{"nums":[99,1,99,1,99,1,99,1,99,1],"swaps":[[0,9],[1,8],[2,7],[3,6],[4,5]]}' },
    { label: 'Long run: 10 values, 12 swaps', input: '{"nums":[5,99,8,26,32,74,8,50,2,78],"swaps":[[0,9],[1,4],[6,8],[2,3],[0,2],[8,9],[5,6],[2,9],[0,7],[3,8],[3,4],[1,2]]}' },
  ],
}

export default function MaximizeAlternatingSumUsingSwaps() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={index => run.input.nums[index]} active={-1}
      roleAt={index => (step.group && step.group.includes(index) ? 'in group' : (index % 2 === 0 ? 'even' : 'odd'))} />
    <output aria-label="Groups">{step.group ? `Group: [${step.group.join(', ')}]. Total so far: ${step.total}` : `Swaps applied: ${run.input.swaps.length}`}</output>
    <output aria-label="Best sum">{step.result === null ? '' : `Best alternating sum: ${step.result}`}</output>
  </>} renderReasoning={() => <>
    <p>Swaps connect indices into groups. Inside a connected group, values can be moved to any of its positions.</p>
    <p>The best arrangement puts the largest values of each group on the even indices, since they are added, and the smallest on the odd indices, since they are subtracted.</p>
  </>} />
}
