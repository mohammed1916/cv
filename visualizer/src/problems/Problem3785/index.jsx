import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import ConflictView from './ConflictView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'count', label: 'Count', description: 'Tally values from nums and forbidden together.' },
    { id: 'limit', label: 'Capacity', description: 'Check that no value exceeds the capacity n.' },
    { id: 'conflict', label: 'Conflicts', description: 'Find indices where nums matches forbidden.' },
    { id: 'tally', label: 'Bounds', description: 'Compute ceil(conflicts / 2) and the largest group.' },
    { id: 'done', label: 'Result', description: 'Report the minimum swaps or -1.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums and forbidden (equal-length integer arrays)',
  url: 'https://leetcode.com/problems/minimum-swaps-to-avoid-forbidden-values/description/',
  complexity: 'O(n) time and O(n) space with hash maps. The visualization caps the length at 12.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,1,2],"forbidden":[1,2,2]}' },
    { label: 'Example 2', input: '{"nums":[3,3,3,1],"forbidden":[3,1,1,3]}' },
    { label: 'Example 3', input: '{"nums":[5,5],"forbidden":[6,5]}' },
    { label: 'Example 4', input: '{"nums":[2,4],"forbidden":[4,2]}' },
  ],
}

export default function MinimumSwapsToAvoidForbiddenValues() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <ConflictView run={run} step={step} />} renderReasoning={() => <>
    <p>An index conflicts when nums and forbidden hold the same value there. Each swap can fix at most two conflicts, and only when the two conflicts hold different values.</p>
    <p>The answer is the larger of two bounds: ceil(conflicts / 2), and the size of the largest group of conflicts sharing one value. A value that appears more than n times across both arrays cannot be placed at all, so the answer is -1.</p>
  </>} />
}
