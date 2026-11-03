import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No letter has been measured yet.' },
    { id: 'letter', label: 'Letter', description: 'Count the forward steps this letter needs to reach a.' },
    { id: 'done', label: 'Result', description: 'The largest step count is the answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s (lowercase letters)',
  url: 'https://leetcode.com/problems/minimum-operations-to-transform-string/',
  complexity: 'O(n) time and O(1) extra space. The visualization caps s at 20 characters.',
  examples: [
    { label: 'Example', input: '{"s":"cab"}' },
    { label: 'Already a', input: '{"s":"aaa"}' },
  ],
}

export default function MinimumOperationsToTransformString() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="s" length={run.input.s.length} valueAt={i => run.input.s[i]} active={step.index} roleAt={i => (i < step.index ? 'done' : '')} />
    <output aria-label="Best step count">{`best = ${step.best}${step.steps === null || step.steps === undefined ? '' : `, this letter = ${step.steps}`}`}</output>
  </>} renderReasoning={() => <>
    <p>Changing a letter moves every copy of it one step forward around the alphabet, so a letter far from a sets the minimum by itself.</p>
    <p>Letters that are passed along the way can merge with others, which is why the answer is the largest single distance rather than the sum.</p>
  </>} />
}
