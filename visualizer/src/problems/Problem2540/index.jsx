import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Both pointers begin at the first values.' },
    { id: 'advance', label: 'Advance', description: 'Move past the smaller value, which cannot be common.' },
    { id: 'found', label: 'Match', description: 'The two values under the pointers are equal.' },
    { id: 'done', label: 'Complete', description: 'No common value exists.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Two sorted lists as JSON, e.g. {"nums1": [1,2,3], "nums2": [2,4]}',
  url: 'https://leetcode.com/problems/minimum-common-value/',
  complexity: 'O(m + n) time and O(1) extra space.',
  examples: [
    { label: 'Merge with a repeat', input: '{"nums1":[1,4,9,9],"nums2":[2,6,6]}' },
    { label: 'Interleaved lists', input: '{"nums1":[10,20,30],"nums2":[5,25,35,45,55]}' },
    { label: 'Single value each', input: '{"nums1":[1],"nums2":[1]}' },
    { label: 'Equal values', input: '{"nums1":[3,3,3],"nums2":[3,3]}' },
    { label: 'Largest and smallest values', input: '{"nums1":[100,100,100,100,100,100,100,100,100,100],"nums2":[1,1,1,1,1,1,1,1,1,1]}' },
    { label: 'Long run: ten sorted values each', input: '{"nums1":[5,8,12,27,38,69,71,73,85,99],"nums2":[11,11,32,39,40,48,50,73,77,79]}' },
  ],
}

export default function MinimumCommonValue() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => (
    <>
      <IndexedSequence label="nums1" length={run.input.nums1.length} valueAt={i => run.input.nums1[i]} active={step.i < run.input.nums1.length ? step.i : -1} />
      <IndexedSequence label="nums2" length={run.input.nums2.length} valueAt={i => run.input.nums2[i]} active={step.j < run.input.nums2.length ? step.j : -1} />
      <output aria-label="Current step">{step.message}</output>
    </>
  )} renderReasoning={() => (
    <>
      <p>Both lists are sorted, so a value smaller than the other pointer's value cannot appear in the other list at or after that pointer.</p>
      <p>Advancing the smaller pointer never skips a possible match, so the first equal pair found is the smallest common value.</p>
    </>
  )} />
}
