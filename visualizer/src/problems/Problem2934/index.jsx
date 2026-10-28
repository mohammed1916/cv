import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Choices', description: 'There are two choices for the last index.' },
    { id: 'choice', label: 'Check', description: 'Charge one swap for each index that needs its pair flipped.' },
    { id: 'done', label: 'Complete', description: 'Report the cheapest valid choice.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with nums1 and nums2 of equal length (values 1 to 9)',
  url: 'https://leetcode.com/problems/minimum-operations-to-maximize-last-elements-in-arrays/',
  complexity: 'O(n) time. The visualization caps the arrays at eight entries.',
  examples: [
    { label: 'Example 1', input: '{"nums1":[1,2,7],"nums2":[4,5,3]}' },
    { label: 'Example 2', input: '{"nums1":[1,9],"nums2":[9,2]}' },
  ],
}

export default function MaximizeLastElements() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums1" length={run.input.nums1.length} valueAt={index => run.input.nums1[index]} active={-1} />
    <IndexedSequence label="nums2" length={run.input.nums2.length} valueAt={index => run.input.nums2[index]} active={-1} />
    <output aria-label="Choice">{`Choice: ${step.choice ?? 'pending'}, cost: ${step.cost ?? '-'}, answer so far: ${step.answer ?? '-'}`}</output>
  </>} renderReasoning={() => <>
    <p>Only the last index has a fixed goal, so two cases are tried: the last pair stays, or it is swapped once.</p>
    <p>For every earlier index, keeping the pair costs nothing if both values fit under the final last values; otherwise a swap costs one, and if neither works the choice is impossible.</p>
  </>} />
}
