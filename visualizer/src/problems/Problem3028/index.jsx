import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'The ant begins on the boundary.' },
    { id: 'move', label: 'Move', description: 'Add the step to the position.' },
    { id: 'return', label: 'Return', description: 'The ant is back at zero, so the count rises.' },
    { id: 'done', label: 'Complete', description: 'Report the number of returns.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with nums (steps from -10 to 10)',
  url: 'https://leetcode.com/problems/ant-on-the-boundary/',
  complexity: 'O(n) time and O(1) space. The visualization caps the steps at 30.',
  examples: [
    { label: 'Example 1', input: '{"nums":[2,3,-5]}' },
    { label: 'Example 2', input: '{"nums":[3,2,-3,-4]}' },
  ],
}

export default function AntOnBoundary() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Steps" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.index} />
    <output aria-label="Position">{`Position ${step.position}, returns ${step.returns}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Only the position after a whole step counts. An ant that crosses the boundary in the middle of a step is not counted there.</p>
  </>} />
}
