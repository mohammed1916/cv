import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MarkingScheduleView from './MarkingScheduleView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '3049',
  phases,
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums and changeIndices (entries of changeIndices count from 1)',
  url: 'https://leetcode.com/problems/earliest-second-to-mark-indices-ii/',
  complexity: 'O(m log m log m) time and O(n) space: binary search over the deadline, and each test scans seconds with heap work. The official limit is 5000 on both lengths; the visualization caps nums at 8 and changeIndices at 16.',
  examples: [
    { label: 'Resets pay off', input: '{"nums":[4,1,5],"changeIndices":[3,1,2,3,1,1,2,2]}' },
    { label: 'Heap must give one up', input: '{"nums":[6,2,9],"changeIndices":[2,2,1,3,3,1,3,1,2]}' },
    { label: 'Impossible', input: '{"nums":[2,3],"changeIndices":[1,1,2]}' },
    { label: 'Nothing to clear', input: '{"nums":[0],"changeIndices":[1]}' },
  ],
}

export default function EarliestSecondToMarkIndicesII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <MarkingScheduleView run={run} step={step} />} renderReasoning={() => <>
    <p>A later deadline can only help, since extra seconds can sit idle, so the deadline can be binary searched. Each candidate then needs a yes or no answer.</p>
    <p>An index cleared by decrements costs its value plus one second to mark it. A reset costs two seconds, the reset and the mark, so it is worth most for large values, and only an index's earliest reset chance matters because it leaves the most room for the mark.</p>
    <p>The mark has to come after the reset, which is why the test walks backward: free then counts seconds later than the current one. Each reset takes one of those for its mark.</p>
    <p>When a reset has no free second left, one reset must go, and the smallest is the one to give up since it saves the least. The heap keeps that one on top. At the end the free seconds must cover all the work that the kept resets did not remove.</p>
  </>} />
}
