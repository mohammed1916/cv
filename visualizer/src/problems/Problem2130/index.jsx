import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2130',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Node values in order as a JSON array (even length)',
  url: 'https://leetcode.com/problems/maximum-twin-sum-of-a-linked-list/',
  complexity: 'O(n) time and O(1) extra space with two pointers on the list.',
  examples: [
    { label: 'Four nodes', input: '[9,1,7,3]' },
    { label: 'Six nodes', input: '[4,2,2,3,7,1]' }, { label: "Two nodes", input: "[1,2]" }, { label: "Equal values", input: "[5,5,5,5]" }, { label: "Largest values", input: "[100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000]" }, { label: "Long run: 40 nodes", input: "[73567,20680,93726,69931,92635,40117,7686,89451,68334,2800,44489,93293,60623,48179,53209,21498,23401,92231,96335,29723,49342,19632,69847,34585,56227,65474,37449,93090,66344,56849,93027,98945,55520,9610,90394,3593,73338,613,4375,94753]" },
  ],
}

export default function Problem2130Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence label="Linked list nodes (l from the head, r from the tail)" length={run.input.values.length} valueAt={i => run.input.values[i]} active={step.l >= 0 ? step.l : -1} roleAt={i => (i === step.l ? 'l' : i === step.r ? 'r' : '')} />
          <RecordStateTable label="Twin pairs" columns={['left', 'right', 'sum']} rows={step.pairs} />
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
