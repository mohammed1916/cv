import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'count', label: 'Count', description: 'Tally values from nums and forbidden together.' },
    { id: 'limit', label: 'Limit', description: 'Check that no value is too crowded to place.' },
    { id: 'conflict', label: 'Conflicts', description: 'Find indices where nums matches forbidden.' },
    { id: 'tally', label: 'Groups', description: 'Find the largest group of conflicts.' },
    { id: 'done', label: 'Result', description: 'Report the minimum swaps or -1.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums and forbidden (equal-length integer arrays)',
  url: 'https://leetcode.com/problems/minimum-swaps-to-avoid-forbidden-values/description/',
  complexity: 'O(n) time and O(n) space with hash maps. The visualization caps the length at 12.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,2,3],"forbidden":[3,2,1]}' },
    { label: 'Example 2', input: '{"nums":[4,6,6,5],"forbidden":[4,6,5,5]}' },
    { label: 'Example 3', input: '{"nums":[7,7],"forbidden":[8,7]}' },
    { label: 'Example 4', input: '{"nums":[1,2],"forbidden":[2,1]}' },
  ],
}

export default function MinimumSwapsToAvoidForbiddenValues() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.at}
      roleAt={i => (step.conflict && i === step.at ? 'conflict' : '')} />
    <IndexedSequence label="forbidden" length={run.input.forbidden.length} valueAt={i => run.input.forbidden[i]} active={step.at}
      roleAt={i => (step.conflict && i === step.at ? 'conflict' : '')} />
    <output aria-label="Swap count state">{`conflicts = ${step.total ?? 'counting'}, largest group = ${step.most ?? 'pending'}, ${step.result !== undefined ? `result = ${step.result}` : 'running'}`}</output>
  </>} renderReasoning={() => <>
    <p>An index conflicts when nums and forbidden hold the same value there. Each swap can fix at most two conflicts, and only when the two conflicts hold different values.</p>
    <p>If the largest value group is bigger than half the conflicts, the leftover conflicts of that value each need their own swap, so the answer is that group size.</p>
  </>} />
}
