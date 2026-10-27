import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import OperationLog from '../../components/shared/OperationLog'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'The stack starts empty.' },
    { id: 'push', label: 'Push', description: 'Add a value if there is room.' },
    { id: 'pop', label: 'Pop', description: 'Remove the top and include its pending increments.' },
    { id: 'increment', label: 'Increment', description: 'Add to the bottom k values with a lazy add.' },
    { id: 'done', label: 'Complete', description: 'Report every pop result.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with max_size and operations such as ["push", 3] (JSON)',
  url: 'https://leetcode.com/problems/design-a-stack-with-increment-operation/',
  complexity: 'O(1) per operation, using one lazy add per stack slot.',
  examples: [
    { label: 'Example 1', input: '{"max_size":3,"operations":[["push",1],["push",2],["pop"],["push",2],["push",3],["push",4],["increment",5,100],["increment",2,100],["pop"],["pop"],["pop"],["pop"]]}' },
  ],
}

export default function IncrementStack() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Stack (bottom to top)" length={step.stack.length} valueAt={i => step.stack[i]} active={step.stack.length - 1} />
    <OperationLog title="Operations" ops={run.ops} current={step.op} through={Math.min(step.op, run.ops.length - 1)} />
  </>} renderReasoning={() => <>
    <p>An increment touches only the bottom k values, so it is stored once at the highest affected slot and passed down when that slot is popped.</p>
  </>} />
}
