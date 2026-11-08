import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import CircularGeneratorView from './CircularGeneratorView'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with arr, steps (the jumps) and startIndex',
  url: `https://leetcode.com/problems/${meta.slug}/`,
  complexity: 'O(1) time per call and O(1) extra space: no call walks the ring, it only does arithmetic. The official limits allow 10,000 values and 100 jumps; this page draws up to 24 values and 30 jumps.',
  examples: [
    { label: 'Both directions', input: '{"arr":[7,3,9,1,6,4,8],"steps":[2,-4,10,-1],"startIndex":2}' },
    { label: 'Whole laps', input: '{"arr":[5,10,15,20],"steps":[8,-12,0,3],"startIndex":1}' },
    { label: 'One value', input: '{"arr":[42],"steps":[3,-7],"startIndex":0}' },
    { label: 'Single entry, zero jump', input: '{"arr":[5],"steps":[0],"startIndex":0}' },
    { label: 'Equal values in arr', input: '{"arr":[3,3,3,3],"steps":[1,1],"startIndex":1}' },
    { label: 'Boundary: values at plus and minus 10000', input: '{"arr":[10000,-10000,10000],"steps":[-10000,10000],"startIndex":2}' },
    { label: 'Long run: 24 entries, 30 jumps', input: '{"arr":[-6279,-44,-1036,6987,1673,-3859,7396,-1952,6222,5712,-7941,961,-320,-9951,-4907,-3679,8910,1232,6683,-9262,-9397,-523,7167,6662],"steps":[-5313,-4890,-6722,1755,4497,2244,-6247,-5038,-5556,1571,1800,9099,6526,3272,-3234,-7990,-8421,-4351,-2924,-6426,-5351,-8768,-2945,-2244,-6382,-6183,-8804,9391,-8687,-2860],"startIndex":7}' },
  ],
}

export default function GenerateCircularArrayValues() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <CircularGeneratorView run={run} step={step} />} renderReasoning={() => <>
    <p>Treating the array as a ring means only the remainder of a jump matters: going around n positions returns to the same index, so a huge jump costs no more than a small one.</p>
    <p>A generator fits because it pauses at each yield with its index still in place, and the value passed to the next call arrives as the result of that yield.</p>
    <p>In JavaScript the remainder of a negative sum is negative, so the reduction needs an extra step: ((i + jump) % n + n) % n. Python's % already returns a value from 0 to n - 1.</p>
  </>} />
}
