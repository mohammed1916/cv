import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Only the empty sum is reachable.' },
    { id: 'base', label: 'Add base', description: 'Each base adds its power as a 0/1 choice.' },
    { id: 'done', label: 'Complete', description: 'Report the number of ways to reach n.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object: n (1-60) and x (1-5)',
  url: 'https://leetcode.com/problems/ways-to-express-an-integer-as-sum-of-powers/',
  complexity: 'O(n * n^(1/x)) time and O(n) space. The visualization caps n at 60.',
  examples: [
    { label: 'Squares', input: '{"n":10,"x":2}' },
    { label: 'Linear', input: '{"n":4,"x":1}' },
  ],
}

export default function SumOfPowers() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Ways to reach each sum" length={run.input.n + 1} valueAt={i => step.ways[i]}
      active={run.input.n} roleAt={i => (step.power !== null && i >= step.power ? 'updated' : '')} />
    <output aria-label="Base">{step.base === null ? 'No base processed yet' : `Base ${step.base} adds ${step.power}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Each base is used at most once, so processing bases in order and updating sums from high to low counts each set exactly once.</p>
  </>} />
}
