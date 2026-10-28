import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with an empty string and no answers.' },
    { id: 'leaf', label: 'Finished string', description: 'A full string is checked against the cost limit.' },
    { id: 'done', label: 'Return', description: 'Report every kept string.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON: {"n": n, "k": k}',
  url: 'https://leetcode.com/problems/valid-binary-strings-with-cost-limit/',
  complexity: 'O(2^n) time in the worst case, since the output itself can be that large. The visualization caps n at 8.',
  examples: [
    { label: 'Example 1', input: '{"n":3,"k":1}' },
    { label: 'Example 2', input: '{"n":1,"k":0}' },
  ],
}

export default function ValidBinaryStringsCost() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <output aria-label="Current string">{`Current string: "${step.text}". Cost: ${step.cost}.`}</output>
    <output aria-label="Kept strings">{`Kept so far: [${step.answers.map(a => `"${a}"`).join(', ')}]`}</output>
    <output aria-label="Step message">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Building one position at a time means a string can be abandoned as soon as it puts two 1s together or its cost already exceeds k.</p>
    <p>Placing a 1 at position i adds i to the cost, so that cost can be checked before the branch is explored.</p>
  </>} />
}
