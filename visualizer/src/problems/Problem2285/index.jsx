import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Degrees', description: 'Count the roads at each city.' },
    { id: 'assign', label: 'Assign', description: 'Give the busiest remaining city the largest unused value.' },
    { id: 'road', label: 'Road', description: 'Add the values of the two cities a road joins.' },
    { id: 'done', label: 'Complete', description: 'Report the maximum total importance.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n (2 to 7 cities) and roads (pairs of city numbers)',
  url: 'https://leetcode.com/problems/maximum-total-importance-of-roads/',
  complexity: 'O(n log n + m) time for the sort and the road sum. The visualization caps input at 7 cities and 12 roads.',
  examples: [
    { label: 'Own case 1', input: '{"n":6,"roads":[[1,2],[2,3],[3,4],[1,3],[2,4],[3,5]]}' },
    { label: 'Own case 2', input: '{"n":6,"roads":[[1,4],[3,5],[2,4]]}' },
    { label: 'Two cities, one road', input: '{"n":2,"roads":[[0,1]]}' },
    { label: 'Triangle, equal importance', input: '{"n":3,"roads":[[0,1],[1,2],[0,2]]}' },
    { label: 'Seven cities, twelve roads', input: '{"n":7,"roads":[[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[1,2],[2,3],[3,4],[4,5],[5,6],[6,1]]}' },
    { label: 'Long run: 7 cities', input: '{"n":7,"roads":[[1,2],[0,1],[4,5],[2,6],[4,6],[2,5],[1,4],[3,6],[2,3],[3,4],[0,6],[3,5]]}' },
  ],
}

export default function MaximumTotalImportance() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Cities (road count / value)" length={step.degree.length} valueAt={i => `${step.degree[i]} / ${step.value[i] || '–'}`} active={step.index} roleAt={i => (step.value[i] ? 'valued' : '')} />
    <output aria-label="Total importance">{`Total so far: ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>A city’s value is counted once for every road it touches, so the total equals the sum of each city’s value times its road count.</p>
    <p>Pairing the largest values with the highest counts maximizes that sum, by the rearrangement inequality.</p>
  </>} />
}
