import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with no beautiful splits.' },
    { id: 'split', label: 'Split', description: 'Cut the array at two positions.' },
    { id: 'beautiful', label: 'Beautiful', description: 'One part is a prefix of the next.' },
    { id: 'done', label: 'Result', description: 'Report the count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (3 to 10 integers from 0 to 3)',
  url: 'https://leetcode.com/problems/count-beautiful-splits-in-an-array/',
  complexity: 'O(n^3) time in this direct version, O(n) extra space. The visualization caps nums at 10 values.',
  examples: [
    { label: 'Example', input: '{"nums":[1,1,2,1]}' },
    { label: 'None', input: '{"nums":[1,2,3,0]}' },
  ],
}

export default function CountBeautifulSplits() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => (
    <>
      <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.j >= 0 ? step.j : -1}
        roleAt={i => (step.i < 0 ? '' : i < step.i ? 'first' : i < step.j ? 'second' : 'third')} />
      <output aria-label="Split">{step.i < 0 ? `Beautiful splits: ${step.count}` : `Cuts at ${step.i} and ${step.j}: ${step.reason}. Count ${step.count}`}</output>
    </>
  )} renderReasoning={() => <>
    <p>A split into three parts is beautiful when the first part is a prefix of the second, or the second is a prefix of the third.</p>
    <p>Both conditions are checked for every pair of cuts, and a split satisfying either one is counted once.</p>
  </>} />
}
