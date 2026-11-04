import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import FrequencyScoreView from './FrequencyScoreView'
import { buildTrace, code, parseInput, phases, python } from './algorithm'

const definition = {
  number: '2968',
  phases,
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums and k',
  url: 'https://leetcode.com/problems/apply-operations-to-maximize-frequency-score/',
  complexity: 'O(n log n) time for the sort, then O(n) for the window because each end only moves right. O(n) space for the prefix sums. The official length is up to 100000; the drawing caps nums at 24 entries.',
  examples: [
    { label: 'Scattered values', input: '{"nums":[9,2,7,3,12,8],"k":6}' },
    { label: 'No budget', input: '{"nums":[5,5,1,5,8],"k":0}' },
    { label: 'One value', input: '{"nums":[6],"k":0}' },
    { label: 'Huge gap, huge budget', input: '{"nums":[1000000000,1,500000000],"k":100000000000000}' },
  ],
}

export default function ApplyOperationsToMaximizeFrequencyScore() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <FrequencyScoreView run={run} step={step} />} renderReasoning={() => <>
    <p>To make a group of values equal, every value should move as little as possible, so the group should be values that sit next to each other once sorted. A gap in the group could always be swapped for a closer value.</p>
    <p>For a fixed block, the median is the cheapest target: moving the target away from it adds more moves on one side than it saves on the other. The gaps drawn on the bars are exactly those moves.</p>
    <p>Dropping the leftmost value never raises the price of a window, so the left end only moves right. Prefix sums turn each gap total into one subtraction instead of a loop.</p>
  </>} />
}
