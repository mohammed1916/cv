import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import PowerGridView from './PowerGridView'
import { buildTrace, code, parseInput, phases, python } from './algorithm'

const definition = {
  number: '3607',
  phases,
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with c, connections and queries ([1, x] checks station x, [2, x] shuts it down)',
  url: 'https://leetcode.com/problems/power-grid-maintenance/',
  complexity: 'O((c + n + q) α(c)) time and O(c) space, since each pointer passes each station at most once across the whole run. Official limits reach 100000 stations and 200000 queries; the drawing caps c at 16 and queries at 20.',
  examples: [
    { label: 'Three grids', input: '{"c":7,"connections":[[2,5],[5,7],[1,3],[4,6]],"queries":[[1,5],[2,2],[1,2],[2,5],[2,7],[1,7],[1,1],[2,3],[1,3],[2,1],[1,3]]}' },
    { label: 'No cables, repeat shutdown', input: '{"c":4,"connections":[],"queries":[[2,2],[2,2],[1,2],[1,4]]}' },
    { label: 'Loop of cables', input: '{"c":5,"connections":[[1,2],[2,3],[3,1],[4,5]],"queries":[[2,1],[2,2],[1,3],[1,1],[2,3],[1,2],[1,4]]}' },
  ],
}

export default function PowerGridMaintenance() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <PowerGridView run={run} step={step} />} renderReasoning={() => <>
    <p>A shutdown never removes a cable, so grid membership is fixed once the cables are read. Union-find works it out once, and queries never have to rebuild it.</p>
    <p>Stations only ever go offline, never back on. An offline station at the front of a sorted list can therefore be skipped permanently, so a one-way pointer always leads to the smallest running station.</p>
    <p>The pointer moves only when a check needs it. A shutdown just flips one flag, so the pointer may rest on an offline station until the next lookup, and all its moves together are bounded by the length of the list.</p>
  </>} />
}
