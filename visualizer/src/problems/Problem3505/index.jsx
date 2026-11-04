import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import WindowDpView from './WindowDpView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '3505',
  phases,
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums, x (window size) and k (window count)',
  url: 'https://leetcode.com/problems/minimum-operations-to-make-elements-within-k-subarrays-equal/',
  complexity: 'About O(n log x) comparisons for the windows, plus list shifts of up to x items per step that heaps would remove, then O(nk) for the table. The official length is up to 100000; the visualization caps nums at 13 entries.',
  examples: [
    { label: 'Two windows of three', input: '{"nums":[4,9,1,-3,7,7,2,12,5,0],"x":3,"k":2}' },
    { label: 'Even window size, exact fit', input: '{"nums":[1,5,2,8],"x":2,"k":2}' },
    { label: 'Already level', input: '{"nums":[6,6,6,6,6],"x":2,"k":2}' },
  ],
}

export default function MinimumOperationsKSubarrays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <WindowDpView run={run} step={step} />} renderReasoning={() => <>
    <p>The problem splits into two questions: what does one window cost, and which k windows should be taken?</p>
    <p>The cheapest common value for a window is its median, as moving the target past it adds steps for more values than it saves. Keeping the window in two sorted halves makes the median the top of the lower half, and the two running sums price all the distances without visiting each value.</p>
    <p>Once each window has a price, the choice is a knapsack over positions. For each prefix, either the last position is not in a chosen window, or a window ends exactly there, which leaves x fewer positions for the other j - 1 windows.</p>
    <p>"At least k" and "exactly k" have the same answer: dropping an extra window never costs more, so the table only tracks exactly j windows.</p>
  </>} />
}
