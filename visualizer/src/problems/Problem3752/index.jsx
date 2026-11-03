import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Setup', description: 'Check that some signing of 1 to n can reach the target.' },
    { id: 'try', label: 'Try', description: 'Test the next candidate for this position.' },
    { id: 'keep', label: 'Keep', description: 'The smallest working candidate is fixed here.' },
    { id: 'empty', label: 'Empty', description: 'No signed permutation reaches the target.' },
    { id: 'done', label: 'Result', description: 'Report the fixed array.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n (1 to 10) and target (-55 to 55)',
  url: 'https://leetcode.com/problems/lexicographically-smallest-negated-permutation-that-sums-to-target/',
  complexity: 'Exponential in this visualization because each feasibility check enumerates subset sums; the caps keep it small.',
  examples: [
    { label: 'Example', input: '{"n":3,"target":0}' },
    { label: 'Impossible', input: '{"n":2,"target":2}' },
  ],
}

export default function LexicographicallySmallestNegatedPermutation() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="answer so far" length={run.input.n} valueAt={i => (step.chosen[i] === undefined ? '·' : step.chosen[i])}
      active={step.at} roleAt={i => (i === step.at ? 'window' : '')} />
    <output aria-label="Remaining target">{`remaining target ${step.need}`}</output>
  </>} renderReasoning={() => <>
    <p>Negating a set N of values gives a total of (sum of 1 to n) minus twice the sum of N. So the target is reachable exactly when some subset of the still-unused values has the right sum.</p>
    <p>Filling positions left to right with the smallest feasible value gives the lexicographically smallest array.</p>
  </>} />
}
