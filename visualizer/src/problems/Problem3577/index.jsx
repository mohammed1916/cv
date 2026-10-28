import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Computer 0 starts unlocked.' },
    { id: 'check', label: 'Check', description: 'Each computer must be stronger than computer 0 to be unlockable by it.' },
    { id: 'done', label: 'Complete', description: 'Report the number of valid orders.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with complexity (JSON)',
  url: 'https://leetcode.com/problems/count-the-number-of-computer-unlocking-permutations/',
  complexity: 'O(n) time and O(1) extra space. The visualization caps n at 7.',
  examples: [
    { label: 'Example 1', input: '{"complexity":[1,2,3]}' },
    { label: 'Example 2', input: '{"complexity":[3,3,3,4,4,4]}' },
  ],
}

export default function CountUnlockingPermutations() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Complexities" length={run.input.complexity.length} valueAt={i => run.input.complexity[i]} active={step.index} roleAt={i => (i === 0 ? 'root' : '')} />
    <output aria-label="Status">{step.phase === 'done' ? `Answer: ${run.result}` : 'Checking'}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>If some computer is no stronger than computer 0, nothing can unlock it, because every route starts at 0 and needs a strictly weaker source.</p>
  </>} />
}
