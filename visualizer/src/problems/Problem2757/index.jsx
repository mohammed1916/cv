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
  ],
}

export default function GenerateCircularArrayValues() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <CircularGeneratorView run={run} step={step} />} renderReasoning={() => <>
    <p>Treating the array as a ring means only the remainder of a jump matters: going around n positions returns to the same index, so a huge jump costs no more than a small one.</p>
    <p>A generator fits because it pauses at each yield with its index still in place, and the value passed to the next call arrives as the result of that yield.</p>
    <p>In JavaScript the remainder of a negative sum is negative, so the reduction needs an extra step: ((i + jump) % n + n) % n. Python's % already returns a value from 0 to n - 1.</p>
  </>} />
}
