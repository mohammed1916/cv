import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Target', description: 'Sort nums2 as the target.' },
    { id: 'try', label: 'Try', description: 'Remove this pair and test the shift.' },
    { id: 'valid', label: 'Valid', description: 'Every value lines up; keep the smaller shift.' },
    { id: 'done', label: 'Result', description: 'The smallest shift that works.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums1 (3 to 10 integers) and nums2 (two fewer values)',
  url: 'https://leetcode.com/problems/find-the-integer-added-to-array-ii/',
  complexity: 'O(n^3 log n) time in this trace: every pair of removals is tested. The trace caps n at 10.',
  examples: [
    { label: 'Own case 1', input: '{"nums1":[5,21,17,13,9],"nums2":[15,19,11]}' },
    { label: 'Own case 2', input: '{"nums1":[4,6,6,4],"nums2":[8,8]}' },
    { label: "Three values", input: "{\"nums1\":[1,2,3],\"nums2\":[4]}" },
    { label: "Equal values", input: "{\"nums1\":[5,5,5],\"nums2\":[5]}" },
    { label: "Negative values", input: "{\"nums1\":[-100,100,-100],\"nums2\":[0]}" },
    { label: "Extreme values, 10 entries", input: "{\"nums1\":[-100,100,-100,100,-100,100,-100,100,-100,100],\"nums2\":[100,-100,100,-100,100,-100,100,-100]}" },
    { label: "Long run: 10 entries", input: "{\"nums1\":[47,17,-45,-31,-95,-69,94,-23,-41,66],\"nums2\":[-70,-60,-91,26,-31,13,5,77]}" },
  ],
}

export default function AddedIntegerII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const removed = step.i === null ? [] : [step.i, step.j]
    const roleOf = i => (removed.includes(i) ? 'removed' : '')
    const target = [...run.input.nums2].sort((a, b) => a - b)
    return <>
      <IndexedSequence label="nums1 (red cells are removed)" length={run.input.nums1.length}
        valueAt={i => run.input.nums1[i]} active={step.i ?? -1} roleAt={roleOf} />
      <IndexedSequence label="Target: nums2 sorted" length={target.length} valueAt={i => target[i]} active={-1} roleAt={() => ''} />
      <output aria-label="Removed pair">{step.i === null ? 'no pair yet' : `removed indices ${step.i} and ${step.j}, shift ${step.x}`}</output>
      <output aria-label="Best shift">{`best shift so far: ${step.best ?? 'none'}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Exactly two values are removed from nums1. For each choice, the smallest remaining value must map to the smallest value of nums2, and the sorted rest must line up with the sorted target after that shift.</p>
  </>} />
}
