import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import OperationLog from '../../components/shared/OperationLog'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2102',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Operations as JSON, e.g. [["add","bob",5],["get"]]',
  url: 'https://leetcode.com/problems/sequentially-ordinal-rank-tracker/',
  complexity: 'Each add is O(log n) to find the slot plus an insertion shift; each get is O(1). The visualization keeps every ranking snapshot for scrubbing.',
  examples: [
    { label: 'Tie on score', input: '[["add","bob",5],["add","ann",7],["get"],["add","cy",7],["get"],["get"]]' },
    { label: 'Insert above the answer', input: '[["add","zed",3],["get"],["add","amy",9],["get"],["add","kit",3],["get"]]' },
  ],
}

export default function Problem2102Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence label="Ranking best to worst" length={step.items.length} valueAt={i => `${step.items[i].name} (${step.items[i].score})`} active={step.mid ?? step.lo ?? -1} roleAt={i => step.marks[i] ?? (i === step.lo ? 'lo' : i === step.hi ? 'hi' : '')} />
          <OperationLog title="Operations so far" ops={run.input.ops.map(op => ({ name: op[0] === 'add' ? 'add' : 'get', args: op.slice(1), returned: undefined }))} current={step.opIndex} through={Math.max(0, step.opIndex)} />
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
