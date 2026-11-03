import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MajorityProbeView from './MajorityProbeView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '1538',
  phases: [
    { id: 'start', label: 'Read', description: 'Learn the length of the hidden bits.' },
    { id: 'base', label: 'Reference', description: 'Query the first four indices for the reference reading.' },
    { id: 'scan', label: 'Scan', description: 'Compare each later index against bit 0 with one swapped probe.' },
    { id: 'pivot', label: 'Pivot', description: 'Place indices 1 to 3 relative to bit 0 using index 4.' },
    { id: 'count', label: 'Count', description: 'Count the two agreement classes.' },
    { id: 'done', label: 'Result', description: 'Return a majority index, or -1 on a tie.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with bits, a list of 0 and 1 (e.g. {"bits":[1,0,1,1,1]})',
  url: 'https://leetcode.com/problems/guess-the-majority-in-a-hidden-array/',
  complexity: 'O(n) queries and O(n) space for the agreement table. Each query inspects four bits, and only about n queries are used. The visualization caps the array at 20 bits.',
  examples: [
    { label: 'Majority of ones', input: '{"bits":[1,0,1,1,1,0,1]}' },
    { label: 'Majority of zeros', input: '{"bits":[0,0,1,0,0]}' },
    { label: 'Exact tie', input: '{"bits":[1,0,1,0,1,0]}' },
  ],
}

export default function GuessMajorityHiddenArray() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <MajorityProbeView run={run} step={step} />} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>A four-index reading only tells whether two bits agree. Swapping one index for index 4 reveals whether that index shares bit 0, so the indices split into two classes whose sizes decide the answer.</p>
  </>} />
}
