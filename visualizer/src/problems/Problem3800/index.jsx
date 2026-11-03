import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import View3800 from './View3800'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin counting mismatches.' },
    { id: 'scan', label: 'Scan', description: 'Classify each index by its bits.' },
    { id: 'costs', label: 'Prices', description: 'Price mixed and same-type pairs.' },
    { id: 'try', label: 'Try', description: 'Try one number of mixed pairs.' },
    { id: 'best', label: 'Best', description: 'Record a cheaper total.' },
    { id: 'done', label: 'Result', description: 'Report the cheapest total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s, t (equal-length binary strings), flipCost, swapCost and crossCost',
  url: 'https://leetcode.com/problems/minimum-cost-to-make-two-binary-strings-equal/',
  complexity: 'O(n) time to classify mismatches, then O(min(a, b)) candidates. The visualization caps the strings at 40 characters.',
  examples: [
    { label: 'Example 1', input: '{"s":"0110","t":"1001","flipCost":4,"swapCost":3,"crossCost":1}' },
    { label: 'Example 2', input: '{"s":"11","t":"00","flipCost":1,"swapCost":9,"crossCost":2}' },
    { label: 'Equal', input: '{"s":"110010","t":"110010","flipCost":7,"swapCost":2,"crossCost":4}' },
  ],
}

export default function MinimumCostToMakeTwoBinaryStringsEqual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <View3800 run={run} step={step} />} renderReasoning={() => <>
    <p>Only indices where the bits disagree matter. Type A has s 0 and t 1; type B has s 1 and t 0. Positions are classified only as the scan reaches them.</p>
    <p>A mixed pair (one A with one B) is fixed by one within-string swap or by two flips. A same-type pair is fixed by two flips or by a cross swap plus a within-string swap. A lone leftover mismatch needs one flip.</p>
    <p>Try every number of mixed pairs, price the leftovers, and keep the cheapest total. The winning breakdown stays visible at the result.</p>
  </>} />
}
