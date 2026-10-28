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
