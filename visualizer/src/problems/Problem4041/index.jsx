import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SumTableView from './SumTableView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Only the empty sum is free.' },
    { id: 'reach', label: 'Reach', description: 'List the values this element can become.' },
    { id: 'copy', label: 'Copy', description: 'Start the new row from the old one.' },
    { id: 'improve', label: 'Extend', description: 'Add this element to a reachable sum.' },
    { id: 'commit', label: 'Commit', description: 'Adopt the new row.' },
    { id: 'done', label: 'Result', description: 'Report the target cost or -1.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with nums and target, e.g. {"nums":[2,3],"target":5}',
  url: 'https://leetcode.com/problems/minimum-operations-to-form-subset-sum-ii/',
  complexity: 'O(n * target * V) time where V is the number of values each element reaches, plus a breadth-first search per element. The visualization caps nums at 6 values, values at 20 and target at 30.',
  examples: [
    { label: 'Doubling helps', input: '{"nums":[3,5,4],"target":10}' },
    { label: 'Halving helps', input: '{"nums":[5,6],"target":7}' },
    { label: "One value", input: "{\"nums\":[1],\"target\":1}" },
    { label: "Equal values", input: "{\"nums\":[4,4,4],\"target\":8}" },
    { label: "Largest values and target", input: "{\"nums\":[20,20,20,20,20,20],\"target\":30}" },
    { label: "Long run: six values", input: "{\"nums\":[2,13,2,1,11,11],\"target\":25}" },
  ],
}

export default function MinimumOperationsSubsetSumII() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <SumTableView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
