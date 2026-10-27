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
    { label: 'Example 1', input: '{"nums":[2,2,3,1,1,0],"k":3}' },
    { label: 'Example 2', input: '{"nums":[1,3,1,1],"k":2}' },
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
