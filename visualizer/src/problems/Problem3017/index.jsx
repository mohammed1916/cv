import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Start with zero counts for every distance.' },
    { id: 'pair', label: 'Pair', description: 'Measure one pair of houses and count both orders.' },
    { id: 'done', label: 'Result', description: 'Every distance has its count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n, x and y (houses 1 to n, 2 to 12 in this trace)',
  url: 'https://leetcode.com/problems/count-the-number-of-houses-at-a-certain-distance-ii/',
  complexity: 'O(n^2) time in this trace, using the three-way shortest distance for each pair. The contest limit needs an O(n) counting method.',
  examples: [
    { label: 'Example 1', input: '{"n":7,"x":2,"y":6}' },
    { label: 'Example 2', input: '{"n":6,"x":1,"y":4}' },
  ],
}

export default function HousesAtDistanceII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="ans (distance k at index k minus one)" length={run.input.n} valueAt={i => step.ans[i]} active={step.dist ? step.dist - 1 : -1}
      roleAt={i => (step.dist && i === step.dist - 1 ? 'pair' : '')} />
    <output aria-label="Current pair">{step.i ? `houses ${step.i} and ${step.j} are ${step.dist} apart` : 'no pair yet'}</output>
  </>} renderReasoning={() => <>
    <p>The houses form a line, plus one extra cable between x and y. The shortest route between two houses is the smaller of walking along the line or using the cable in either direction.</p>
    <p>Each pair adds two ordered counts to the entry for its distance.</p>
  </>} />
}
