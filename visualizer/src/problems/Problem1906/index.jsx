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
    { label: 'Example 1', input: '{"nums":[1,3,4,8],"queries":[[0,1],[1,2],[2,3],[0,3]]}' },
    { label: 'Example 2', input: '{"nums":[4,5,2,2,7,10],"queries":[[2,3],[0,2],[0,5]]}' },
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
