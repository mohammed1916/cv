import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '2481',
  phases: [
    { id: 'check', label: 'Check', description: 'Test whether one piece is needed.' },
    { id: 'even', label: 'Even', description: 'Even n uses diameters through the centre.' },
    { id: 'odd', label: 'Odd', description: 'Odd n needs one cut per piece.' },
    { id: 'done', label: 'Result', description: 'Return the number of cuts.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"n": 4}',
  url: 'https://leetcode.com/problems/minimum-cuts-to-divide-a-circle/',
  complexity: 'O(1) time and O(1) space.',
  examples: [
    { label: 'Example 1', input: '{"n":4}' },
    { label: 'Example 2', input: '{"n":3}' },
  ],
}

export default function MinimumCutsToDivideACircle() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <output aria-label="Cuts">{`n = ${run.input.n}, cuts = ${step.result === null ? '...' : step.result}`}</output>
    <p role="status">{step.message}</p>
  </>} renderReasoning={() => <>
    <p>With an even count, every cut is a diameter through the centre, and two diameters give four equal pieces, so n/2 diameters give n pieces.</p>
    <p>With an odd count, no line through the centre can split the circle into n equal pieces with fewer than n cuts, so the answer is n. One piece needs no cut at all.</p>
  </>} />
}
