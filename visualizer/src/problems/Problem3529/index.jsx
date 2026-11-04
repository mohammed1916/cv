import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import PatternCoverageView from './PatternCoverageView'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with grid (rows of single letters) and pattern',
  url: `https://leetcode.com/problems/${meta.slug}/`,
  complexity: 'O(mn + k) time and O(mn + k) space, for k pattern letters. The official limit is 100,000 cells; this page draws up to 64.',
  examples: [
    { label: 'Crossing', input: '{"grid":[["t","r","e","e"],["r","a","x","p"],["e","q","z","k"],["e","n","v","b"]],"pattern":"tree"}' },
    { label: 'Wrapping', input: '{"grid":[["x","y","a"],["b","a","c"],["d","b","e"]],"pattern":"aba"}' },
    { label: 'No overlap', input: '{"grid":[["m","o"],["q","p"]],"pattern":"mo"}' },
    { label: 'Single row', input: '{"grid":[["r","u","n"]],"pattern":"run"}' },
  ],
}

export default function CountCellsInOverlappingSubstrings() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <PatternCoverageView run={run} step={step} />} renderReasoning={() => <>
    <p>Wrapping makes each reading one long string: the rows joined end to end, and the columns joined end to end. A match that crosses a row or column boundary is then just an ordinary substring.</p>
    <p>KMP finds every occurrence, overlapping ones included, without rereading text: on a mismatch the fail table says how much of the pattern is already known to match.</p>
    <p>Marking each match cell by cell could be slow when matches overlap heavily. A +1 at the start and a -1 after the end, then one running sum, marks all of them in a single sweep.</p>
    <p>Position r·n + c in the row reading and c·m + r in the column reading are the same cell, so the two results can be compared directly.</p>
  </>} />
}
