import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Circle', description: 'Tiles start in their given colours.' },
    { id: 'count', label: 'Count groups', description: 'Count windows inside each run of differing neighbours.' },
    { id: 'update', label: 'Recolour', description: 'Change one tile colour.' },
    { id: 'done', label: 'Complete', description: 'Report the answers.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"colors": [0/1 circle], "queries": [[1, size] or [2, index, color]]}',
  url: 'https://leetcode.com/problems/alternating-groups-iii/',
  complexity: 'O(n) per count query for this visualization, which rescans the circle. The official problem needs a segment tree for speed.',
  examples: [
    { label: 'Example 1', input: '{"colors":[0,1,0,1,0],"queries":[[1,3]]}' },
    { label: 'Updates', input: '{"colors":[0,1,0,0,1],"queries":[[1,3],[2,2,1],[1,4]]}' },
  ],
}

export default function AlternatingGroupsIII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Tile colours on the circle" length={step.colors.length} active={step.query && step.query[0] === 2 ? step.query[1] : -1}
      valueAt={i => step.colors[i]} roleAt={i => (step.query && step.query[0] === 2 && step.query[1] === i ? 'changed' : '')} />
    <output aria-label="Groups">{step.count === null ? 'No count yet' : `Groups: ${step.count} (good runs: ${step.runs.join(', ') || 'none'})`}</output>
    <p>{step.message}</p>
  </>} renderReasoning={() => <>
    <p>Two tiles are a good pair when their colours differ. A group of size s is s tiles with s minus 1 good pairs in a row.</p>
    <p>A run of r good pairs holds r minus s plus 2 such groups, and a fully alternating circle counts every start.</p>
  </>} />
}
