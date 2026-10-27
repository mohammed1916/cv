import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin at tile 0 with a run of one tile.' },
    { id: 'scan', label: 'Scan', description: 'Move around the circle and extend or reset the alternating run.' },
    { id: 'count', label: 'Count', description: 'A run of at least k tiles is one alternating group.' },
    { id: 'done', label: 'Complete', description: 'Report the number of groups.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with colors (0 and 1 values in a circle, up to 40) and k, for example {"colors":[0,1,0,1,0],"k":3}',
  url: 'https://leetcode.com/problems/alternating-groups-ii/',
  complexity: 'O(n + k) time by reading the circle once around, with the run kept as a single number. The visualization caps colors at 40 entries.',
  examples: [
    { label: 'Example 1', input: '{"colors":[0,1,0,1,0],"k":3}' },
    { label: 'Example 2', input: '{"colors":[0,1,0,0,1,0,1],"k":6}' },
  ],
}

export default function AlternatingGroups() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Tiles (circular)" length={run.input.colors.length} valueAt={index => run.input.colors[index]} active={step.at}
      roleAt={index => (step.members.includes(index) ? 'group' : '')} />
    <output aria-label="Alternating run">{`Current run: ${step.run} of ${run.input.k} needed. Groups counted: ${step.count}`}</output>
  </>} renderReasoning={() => <>
    <p>A group is a block of k neighbouring tiles on the circle in which each neighbouring pair differs.</p>
    <p>Walking one lap plus k-2 extra tiles lets every block that wraps past the last tile be seen as an ordinary run.</p>
  </>} />
}
