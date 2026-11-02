import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No expression is scored yet.' },
    { id: 'pivot', label: 'Middle j', description: 'Fix the middle index.' },
    { id: 'left', label: 'Left max', description: 'Largest value before the middle.' },
    { id: 'right', label: 'Right min', description: 'Smallest value after the middle.' },
    { id: 'value', label: 'Score', description: 'Combine the three choices.' },
    { id: 'update', label: 'Update', description: 'Keep the larger score.' },
    { id: 'done', label: 'Result', description: 'Report the maximum expression.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (at least 3 integers)',
  url: 'https://leetcode.com/problems/maximize-expression-of-three-elements/',
  complexity: 'O(n^2) in this trace, which takes prefix maxima and suffix minima directly. Prefix and suffix arrays would make it O(n).',
  examples: [
    { label: 'Example', input: '{"nums":[1,5,3,2]}' },
    { label: 'Ascending', input: '{"nums":[1,2,3,4]}' },
  ],
}

export default function MaximizeExpressionOfThreeElements() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.at}
      roleAt={i => (step.at >= 0 && i === step.at ? 'middle j' : '')} />
    <output aria-label="Expression state">{`middle j = ${step.at >= 0 ? step.at : 'none'}, best = ${step.best === null || step.best === undefined ? 'none' : step.best}`}</output>
  </>} renderReasoning={() => <>
    <p>For a fixed middle index j, the first term should be the largest value before j and the last term the smallest value after j.</p>
    <p>Trying every middle index and keeping the best score covers every valid triple.</p>
  </>} />
}
