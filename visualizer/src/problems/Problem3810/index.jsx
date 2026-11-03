import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with nums as it is.' },
    { id: 'pick', label: 'Choose value', description: 'The first wrong position fixes which value to pick.' },
    { id: 'update', label: 'Update', description: 'Each position holding that value takes its target.' },
    { id: 'done', label: 'Result', description: 'nums now equals target.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums and target (equal-length lists, values 1 to 4)',
  url: 'https://leetcode.com/problems/minimum-operations-to-reach-target-array/',
  complexity: 'O(n) per operation, and one operation per distinct mismatched value. The visualization stays small (n up to 8).',
  examples: [
    { label: 'Two values', input: '{"nums":[1,2,3],"target":[2,1,3]}' },
    { label: 'Repeated value', input: '{"nums":[4,1,4],"target":[5,1,4]}' },
  ],
}

export default function MinimumOperationsReachTargetArray() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => step.state?.[i] ?? run.input.nums[i]} active={step.at}
      roleAt={i => (step.state && step.state[i] !== run.input.target[i] ? 'window' : '')} />
    <IndexedSequence label="target" length={run.input.target.length} valueAt={i => run.input.target[i]} active={-1} />
    <output aria-label="Target array state">{`operations ${step.ops}${step.value !== null && step.value !== undefined ? `, chosen value ${step.value}` : ''}`}</output>
  </>} renderReasoning={() => <>
    <p>Every position that is still wrong keeps its original value until something updates it. So each distinct wrong value must be chosen once.</p>
    <p>Choosing a value updates all positions that hold it, because every such position lies in some maximal run of that value.</p>
  </>} />
}
