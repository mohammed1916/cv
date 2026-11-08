import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'horizontal', label: 'Rows', description: 'Find the longest run of removable horizontal bars.' },
    { id: 'vertical', label: 'Columns', description: 'Find the longest run of removable vertical bars.' },
    { id: 'done', label: 'Complete', description: 'Take the smaller run, add one, and square it.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with n, m, h_bars and v_bars',
  url: 'https://leetcode.com/problems/maximize-area-of-square-hole-in-grid/',
  complexity: 'O(b log b) time for b bars. The visualization caps the grid at eight rows and columns.',
  examples: [
    { label: 'Example 1', input: '{"n":2,"m":1,"h_bars":[2,3],"v_bars":[2]}' },
    { label: 'Example 2', input: '{"n":2,"m":3,"h_bars":[2,3],"v_bars":[2,4]}' },
    { label: 'No bars', input: '{"n":1,"m":1,"h_bars":[],"v_bars":[]}' },
    { label: 'Two bars each way', input: '{"n":2,"m":2,"h_bars":[2,3],"v_bars":[2,3]}' },
    { label: 'Largest grid, six bars', input: '{"n":8,"m":8,"h_bars":[2,4,6,8,9,3],"v_bars":[9,7,5,3,2,4]}' },
    { label: 'Long run: six bars each way', input: '{"n":8,"m":8,"h_bars":[9,2,4,7,6,8],"v_bars":[2,3,4,8,9,7]}' },
  ],
}

export default function MaximizeSquareHole() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Horizontal bars" length={run.input.h_bars.length} valueAt={index => run.input.h_bars[index]} active={-1} />
    <IndexedSequence label="Vertical bars" length={run.input.v_bars.length} valueAt={index => run.input.v_bars[index]} active={-1} />
    <output aria-label="Runs">{`Longest horizontal run: ${step.hRun}, vertical run: ${step.vRun}${step.side === null ? '' : `, side ${step.side}`}`}</output>
  </>} renderReasoning={() => <>
    <p>Removing k consecutive horizontal bars opens a gap of k+1 rows, and the same holds for columns.</p>
    <p>A square needs both dimensions, so the side is one more than the shorter of the two longest runs.</p>
  </>} />
}
