import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Sort', description: 'Order both cut lists from most expensive to cheapest.' },
    { id: 'horizontal', label: 'Horizontal', description: 'Cut the next horizontal line; it crosses every vertical piece.' },
    { id: 'vertical', label: 'Vertical', description: 'Cut the next vertical line; it crosses every horizontal piece.' },
    { id: 'done', label: 'Complete', description: 'Report the minimum total cost.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with m, n, horizontalCut (m minus 1 costs) and verticalCut (n minus 1 costs)',
  url: 'https://leetcode.com/problems/minimum-cost-for-cutting-cake-ii/',
  complexity: 'O(m log m + n log n) time after sorting the costs. The visualization caps the cake at 30 by 30; the algorithm is the same for the larger limits.',
  examples: [
    { label: 'Example 1', input: '{"m":3,"n":2,"horizontalCut":[1,3],"verticalCut":[5]}' },
    { label: 'Example 2', input: '{"m":2,"n":2,"horizontalCut":[7],"verticalCut":[4]}' },
  ],
}

export default function Cake() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const h = [...run.input.horizontalCut].sort((a, b) => b - a)
    const v = [...run.input.verticalCut].sort((a, b) => b - a)
    return <>
      <IndexedSequence label="Horizontal cut costs (largest first)" length={h.length} valueAt={i => h[i]} active={step.h < h.length ? step.h : -1} roleAt={i => (i < step.h ? 'made' : '')} />
      <IndexedSequence label="Vertical cut costs (largest first)" length={v.length} valueAt={i => v[i]} active={step.v < v.length ? step.v : -1} roleAt={i => (i < step.v ? 'made' : '')} />
      <output aria-label="Piece counts">{`Pieces: ${step.hp} horizontal by ${step.vp} vertical. Total cost: ${step.total}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>A horizontal cut crosses every vertical strip, so its cost is multiplied by the number of vertical pieces at that moment, and the reverse for vertical cuts.</p>
    <p>Making the most expensive cut first is the greedy choice: a cut made later is multiplied by at least as many pieces.</p>
  </>} />
}
