import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import OperationLog from '../../components/shared/OperationLog'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Empty text, cursor at the start.' },
    { id: 'add', label: 'Add text', description: 'Insert letters at the cursor.' },
    { id: 'delete', label: 'Delete', description: 'Remove letters just left of the cursor.' },
    { id: 'move', label: 'Move cursor', description: 'Shift the cursor and report the last 10 letters on its left.' },
    { id: 'done', label: 'Complete', description: 'Report every return value.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with operations such as ["addText", "abc"] (JSON)',
  url: 'https://leetcode.com/problems/design-a-text-editor/',
  complexity: 'O(k) per operation for k letters moved, with a cap of 10 letters per answer.',
  examples: [
    { label: 'Example 1', input: '{"operations":[["addText","leetcode"],["deleteText",4],["addText","practice"],["cursorRight",3],["cursorLeft",8],["deleteText",10],["cursorLeft",2],["cursorRight",6]]}' },
  ],
}

export default function TextEditor() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <output aria-label="Text around the cursor">{`${step.left || ''}|${step.right || ''}`}</output>
    <p>{`Left of the cursor: "${step.left}". Right of the cursor: "${step.right}".`}</p>
    <OperationLog title="Operations" ops={run.ops} current={step.op} through={Math.min(step.op, run.ops.length - 1)} />
  </>} renderReasoning={() => <>
    <p>Two stacks hold the text on each side of the cursor, so moving the cursor by k letters is k pops and pushes.</p>
    <p>The answer only needs the last 10 letters left of the cursor, which is a slice of the left side.</p>
  </>} />
}
