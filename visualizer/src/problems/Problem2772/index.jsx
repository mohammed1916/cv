import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Set up the sweep with no active operations.' },
    { id: 'check', label: 'Check', description: 'Remove operations that ended, then compare the value with the active count.' },
    { id: 'start-ops', label: 'Start', description: 'Start only the operations this position still needs.' },
    { id: 'fail', label: 'Fail', description: 'A position can no longer be fixed.' },
    { id: 'done', label: 'Complete', description: 'Every position reaches zero.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums and k (JSON)',
  url: 'https://leetcode.com/problems/apply-operations-to-make-all-array-elements-equal-to-zero/',
  complexity: 'O(n) time and O(n) space. The visualization caps input at 12 values.',
  examples: [
    { label: 'Zeros among five values', input: '{"nums":[5,0,1,5,1],"k":2}' },
    { label: 'Eight values, larger k', input: '{"nums":[0,7,7,3,10,0,6,2],"k":5}' },
    { label: 'Single value, k 1', input: '{"nums":[0],"k":1}' },
    { label: 'Equal values', input: '{"nums":[5,5,5,5],"k":2}' },
    { label: 'Boundary: k equals length 12', input: '{"nums":[10,0,10,0,10,0,10,0,10,0,10,0],"k":12}' },
    { label: 'Long run: 12 values', input: '{"nums":[7,9,7,4,10,5,10,6,3,4,9,10],"k":5}' },
  ],
}

export default function ApplyOperationsZero() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Values" length={run.input.nums.length} valueAt={i => run.input.nums[i]} roleAt={i => (i === step.index ? `covered by ${step.active}` : '')} active={step.index} />
    <output aria-label="Active operations">{`Operations covering this position: ${step.active}`}</output>
  </>} renderReasoning={() => <>
    <p>An operation can only lower positions, so a position must be lowered by exactly the operations that cover it.</p>
    <p>Starting operations as late as possible, at the first position that still needs them, is forced and never worse.</p>
  </>} />
}
