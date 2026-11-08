import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Counts', description: 'Build a running count of each value.' },
    { id: 'query', label: 'Query', description: 'Start a query over one range.' },
    { id: 'value', label: 'Values', description: 'Walk the values present in the range in increasing order.' },
    { id: 'answer', label: 'Answer', description: 'Record the smallest gap for this range.' },
    { id: 'done', label: 'Complete', description: 'Report every answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'An object with nums (1 to 12 integers from 1 to 100) and queries ([l, r] pairs)',
  url: 'https://leetcode.com/problems/minimum-absolute-difference-queries/',
  complexity: 'O(V * (n + q)) time for V distinct values. The visualization caps input at 12 numbers and 5 queries.',
  examples: [
    { label: 'Own case 1', input: '{"nums":[8,4,3,1],"queries":[[0,3],[2,3],[1,2],[0,1]]}' },
    { label: 'Example 2', input: '{"nums":[4,5,2,2,7,10],"queries":[[2,3],[0,2],[0,5]]}' },
  { label: 'Single element query', input: "{\"nums\":[7],\"queries\":[[0,0]]}" },
  { label: 'Equal values', input: "{\"nums\":[5,5,5,5],\"queries\":[[0,3],[1,2]]}" },
  { label: 'Full array, largest values', input: "{\"nums\":[100,100,100,100,100,100,100,100,100,100,100,100],\"queries\":[[0,11]]}" },
  { label: 'Long run: 12 values', input: "{\"nums\":[64,89,88,33,18,73,55,95,29,16,81,50],\"queries\":[[9,9],[2,9],[1,11],[4,5],[4,4]]}" },
  ],
}

export default function MinimumAbsoluteDifferenceQueries() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={index => run.input.nums[index]} active={step.index}
      roleAt={index => step.range && index >= step.range[0] && index <= step.range[1] ? 'in range' : ''} />
    <output aria-label="Values present">{`Values in range: ${step.present.length ? step.present.join(', ') : '(none yet)'}`}</output>
    <output aria-label="Best gap">{`Smallest gap: ${step.best === null || step.best === -1 ? (step.best === -1 ? 'none yet' : '(none)') : step.best}`}</output>
  </>} renderReasoning={() => <>
    <p>Only the neighbours in sorted order can give the smallest gap, so the values in a range are listed in increasing order.</p>
    <p>Prefix counts show which values occur in a range in constant time, which avoids scanning the range for each value.</p>
  </>} />
}
