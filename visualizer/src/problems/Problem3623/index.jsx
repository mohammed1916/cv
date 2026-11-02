import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No height has been counted yet.' },
    { id: 'count', label: 'Count', description: 'Add this point to its height.' },
    { id: 'pairs', label: 'Pairs', description: 'Pairs of points on this height form horizontal segments.' },
    { id: 'add', label: 'Pair up', description: 'Each earlier segment pairs with each new segment.' },
    { id: 'extend', label: 'Extend', description: 'Count this height as seen.' },
    { id: 'done', label: 'Result', description: 'Report the trapezoid count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'List of distinct [x, y] points',
  url: 'https://leetcode.com/problems/count-number-of-trapezoids-i/',
  complexity: 'O(n) time with a hash map of heights. The visualization caps the point list at 8.',
  examples: [
    { label: 'Example', input: '[[1,0],[2,0],[3,0],[2,2],[3,2]]' },
    { label: 'Two heights', input: '[[0,0],[1,0],[0,1],[1,1]]' },
  ],
}

export default function CountTrapezoidsI() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <output aria-label="Height being counted">{`height = ${step.level ?? 'none'}`}</output>
    <output aria-label="Segments">{`segments on this height = ${step.pairs}, seen before = ${step.seen}, total = ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>Two horizontal segments on different heights form one trapezoid with any other pair of such segments, so each height contributes its pair count times the pair counts of all earlier heights.</p>
    <p>A running total of segments seen so far turns this into one pass over the heights.</p>
  </>} />
}
