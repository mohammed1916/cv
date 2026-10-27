import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Choices', description: 'Count the 2^n direction choices.' },
    { id: 'uniform', label: 'Uniform', description: 'Check the all-clockwise choice for collisions.' },
    { id: 'mixed', label: 'Mixed', description: 'Check a mixed choice, which always has a collision.' },
    { id: 'done', label: 'Complete', description: 'Subtract the two collision-free choices.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n, the number of monkeys and vertices (JSON)',
  url: 'https://leetcode.com/problems/count-collisions-of-monkeys-on-a-polygon/',
  complexity: 'O(1) time with fast exponentiation. The visualization caps n at 12 and shows one choice of each kind.',
  examples: [
    { label: 'Triangle', input: '{"n":3}' },
    { label: 'Square', input: '{"n":4}' },
  ],
}

export default function MonkeyCollisions() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Monkeys landing on each vertex" length={run.n} valueAt={i => step.counts[i]}
      active={-1} roleAt={i => (step.counts[i] > 1 ? 'collision' : '')} />
    <output aria-label="Choices">{`Total choices 2^${run.n} = ${2 ** run.n}; collision choices = total - 2`}</output>
  </>} renderReasoning={() => <>
    <p>If no two monkeys share a vertex, each vertex receives exactly one monkey, which forces all monkeys to face the same way.</p>
    <p>So only the all-clockwise and all-anticlockwise choices avoid collisions, and the answer is 2^n - 2.</p>
  </>} />
}
