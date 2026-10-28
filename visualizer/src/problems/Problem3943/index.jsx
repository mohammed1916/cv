import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Queries run in order on the starting arrays.' },
    { id: 'update', label: 'Range add', description: 'Add val to every nums2 entry in the range.' },
    { id: 'count', label: 'Count pairs', description: 'Look up how many nums2 values complete each nums1 value to tot.' },
    { id: 'done', label: 'Return', description: 'Report every type 2 answer in order.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON: {"nums1": [...], "nums2": [...], "queries": [[1, x, y, val] | [2, tot], ...]}',
  url: 'https://leetcode.doocs.org/en/lc/3943/',
  complexity: 'O(n2 + n1) per type 2 query plus O(length) per type 1 query. The visualization caps the sizes at 4 and 8.',
  examples: [
    { label: 'Example 1', input: '{"nums1":[1,2],"nums2":[3,4],"queries":[[2,5],[1,0,0,2],[2,5]]}' },
    { label: 'Example 3', input: '{"nums1":[2,5,8,4],"nums2":[1,3,8],"queries":[[2,9],[1,1,2,1],[2,10]]}' },
  ],
}

export default function NumberOfPairsAfterIncrement() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="nums2 (after updates so far)" length={step.nums2.length} valueAt={j => step.nums2[j]} active={-1} />
    <output aria-label="Answers so far">{`Answers: [${step.answers.join(', ')}]. ${step.message}`}</output>
  </>} renderReasoning={() => <>
    <p>Each type 2 query needs the count of nums2 values equal to tot minus each nums1 value, so a frequency table answers it with one lookup per nums1 entry.</p>
    <p>Type 1 queries change nums2 directly, which keeps the frequency table current for the next query.</p>
  </>} />
}
