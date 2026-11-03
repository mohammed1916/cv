import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Candidates', description: 'List the distinct pairwise Manhattan distances.' },
    { id: 'probe', label: 'Probe', description: 'Test whether a candidate factor can be achieved.' },
    { id: 'done', label: 'Result', description: 'Report the largest factor that passes.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with points (2 to 8 integer [x, y] pairs)',
  url: 'https://leetcode.com/problems/maximum-partition-factor/',
  complexity: 'Binary search over distinct distances with a bipartiteness check per probe. The visualization caps the point count at 8.',
  examples: [
    { label: 'Square corners', input: '{"points":[[0,0],[0,2],[2,0],[2,2]]}' },
    { label: 'Three points', input: '{"points":[[0,0],[0,1],[10,0]]}' },
  ],
}

export default function MaximumPartitionFactor() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Points" length={step.points.length} valueAt={i => `${step.points[i][0]},${step.points[i][1]}`}
      active={-1} roleAt={i => (step.colors ? (step.colors[i] === 0 ? 'group A' : 'group B') : '')} />
    <output aria-label="Partition status">{step.probe === null
      ? `${step.candidates.length} candidate factors`
      : `factor ${step.probe}: ${step.ok === false ? 'two groups are impossible' : step.phase === 'done' ? 'maximum found' : 'two groups are possible'}`}</output>
  </>} renderReasoning={() => <>
    <p>A split with factor at least d is exactly a split where every pair closer than d goes across the two groups. That is a two-coloring of the closeness graph, so each probe is a bipartiteness test.</p>
    <p>The best factor is a pairwise distance, and a larger candidate can only be harder to achieve, so binary search finds the largest candidate that still passes.</p>
  </>} />
}
