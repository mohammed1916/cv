import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import PairCountView from './PairCountView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '3339',
  phases: [
    { id: 'setup', label: 'Setup', description: 'Count the even and odd values.' },
    { id: 'init', label: 'Length 1', description: 'Each single entry starts with no pairs.' },
    { id: 'extend', label: 'Extend', description: 'Add one entry and update the table.' },
    { id: 'done', label: 'Result', description: 'Read the target row.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n (length), m (largest value) and k (good pairs)',
  url: 'https://leetcode.com/problems/find-the-number-of-k-even-arrays/',
  complexity: 'O(n * k) time and O(k) space with modular arithmetic. Reading used here: a pair is good when both entries are even, which is the parity condition behind a*b-a-b being even; the answer is taken modulo 1000000007. The visualization caps n at 12 and m at 30.',
  examples: [
    { label: 'Small table', input: '{"n":4,"m":5,"k":2}' },
    { label: 'Single good pair', input: '{"n":3,"m":4,"k":1}' },
  ],
}

export default function KEvenArrays() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <PairCountView run={run} step={step} />}
      renderReasoning={({ step }) => (
        <>
          <p>Each new entry either makes the pair with the previous one good (only an even entry after an even entry) or not. The table tracks the two parities separately, so the transition is a pair of sums.</p>
          <p>{step.phase === 'done' ? `The answer is ${step.result} modulo 1000000007.` : 'The table is rebuilt from the previous length on every step.'}</p>
        </>
      )}
    />
  )
}
