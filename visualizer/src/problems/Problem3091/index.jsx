import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'The fallback plan raises 1 to k.' },
    { id: 'candidate', label: 'Candidate', description: 'Raise one element to x, then copy it.' },
    { id: 'improve', label: 'Improve', description: 'This plan uses fewer operations.' },
    { id: 'done', label: 'Result', description: 'The fewest operations found.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Integer k from 1 to 200',
  url: 'https://leetcode.com/problems/apply-operations-to-make-sum-of-array-greater-than-or-equal-to-k/',
  complexity: 'O(k) time in this trace, trying every value x for the single repeated element.',
  examples: [
    { label: 'Example 1', input: '1' },
    { label: 'Example 2', input: '2' },
    { label: 'Example 3', input: '11' },
  ],
}

export default function SumAtLeastK() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <output aria-label="Candidate plan">{step.x === null ? `target k = ${run.input}` : `x = ${step.x}, copies = ${step.copies}, operations = ${step.ops}`}</output>
    <output aria-label="Best so far">{`best so far: ${step.best}`}</output>
  </>} renderReasoning={() => <>
    <p>Every element except the first copy is made by a duplicate. The best plan raises one value to x and copies it until the sum reaches k.</p>
    <p>Trying each x gives the answer, because copies of one value give the smallest total cost for a given sum.</p>
  </>} />
}
