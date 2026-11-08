import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import PairSumView from './PairSumView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '3979',
  phases: [
    { id: 'start', label: 'Setup', description: 'Start the scan at the first allowed right end.' },
    { id: 'extend', label: 'Extend', description: 'Admit the left index that is now k places behind.' },
    { id: 'prefix', label: 'Best left', description: 'A larger left value replaces the prefix best.' },
    { id: 'candidate', label: 'Pair', description: 'Sum the best left value with the right end.' },
    { id: 'done', label: 'Result', description: 'Report the best pair sum.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums and k (e.g. {"nums":[4,1,9,2,7],"k":2})',
  url: 'https://leetcode.com/problems/maximum-valid-pair-sum/',
  complexity: 'O(n) time and O(1) extra space. The visualization caps nums at 12 values; the official limit is 100,000.',
  examples: [
    { label: 'Gap of two', input: '{"nums":[4,1,9,2,7],"k":2}' },
    { label: 'Adjacent allowed', input: '{"nums":[3,8,1],"k":1}' },
    { label: "Two values", input: '{"nums":[5,9],"k":1}' },
    { label: "Equal values", input: '{"nums":[6,6,6,6],"k":3}' },
    { label: "Largest gaps", input: '{"nums":[1,50,1,50,1,50],"k":5}' },
    { label: "Long run: 12 values", input: '{"nums":[39,10,14,48,13,39,23,1,35,9,9,31],"k":4}' },
  ],
}

export default function MaximumValidPairSum() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <PairSumView run={run} step={step} />}
    renderReasoning={({ step }) => <>
      <p>{step.message}</p>
      <p>Only indices at most j minus k may pair with j, so the best of them is kept as a running maximum.</p>
    </>} />
}
