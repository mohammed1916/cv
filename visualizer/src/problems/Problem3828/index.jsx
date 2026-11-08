import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'First end', description: 'Read the first element, the left endpoint.' },
    { id: 'ends', label: 'Last end', description: 'Read the last element, the right endpoint.' },
    { id: 'done', label: 'Complete', description: 'Keep the larger endpoint as the final element.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Game array (JSON object with nums)',
  url: 'https://leetcode.com/problems/final-element-after-subarray-deletions/',
  complexity: 'O(1) time and O(1) extra space. The visualization caps input at 30 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,5,2]}' },
    { label: 'Example 2', input: '{"nums":[3,7]}' },
    { label: 'One value', input: '{"nums":[1]}' },
    { label: 'Equal values', input: '{"nums":[7,7,7]}' },
    { label: 'Largest value between two smaller', input: '{"nums":[100000,1,100000]}' },
    { label: 'Long run: 30 values', input: '{"nums":[81389,94158,51862,11226,76814,26803,4072,86760,4267,61707,68915,53582,78001,16320,14510,48867,41648,84010,51432,65761,33378,99571,91620,11184,98640,11025,69631,53093,34764,73442]}' },
  ],
}

export default function FinalElementAfterDeletions() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Array" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.index}
      roleAt={i => (i === 0 || i === run.input.nums.length - 1 ? 'end' : '')} />
    <output aria-label="Result">{step.result === null ? 'Result pending' : `Final element: ${step.result}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Alice removes the middle in one move, which keeps both ends. Bob then removes any middle element that is still there, so only the two endpoints can end up as the final element.</p>
  </>} />
}
