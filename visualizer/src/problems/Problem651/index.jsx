import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { DPTable } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty table', description: 'Zero presses give an empty screen.' },
    { id: 'press', label: 'Press A', description: 'The default move extends the previous best by one.' },
    { id: 'paste', label: 'Copy and paste', description: 'A copy at an earlier key can beat pressing A repeatedly.' },
    { id: 'done', label: 'Answer', description: 'The last cell is the most A\'s after n presses.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Number of key presses n (JSON integer, 1–50)',
  url: 'https://leetcode.com/problems/4-keys-keyboard/',
  complexity: 'O(n²) time for the nested scan, with O(n) extra space for the table.',
  examples: [
    { label: 'Small', input: '3' },
    { label: 'Copy wins', input: '7' },
    { label: 'Longer', input: '12' },
  ],
}

export default function FourKeysKeyboard() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <DPTable title="Best screen length after each press" values={[step.dp]}
      activeCell={step.phase === 'start' ? null : { row: 0, column: step.index }}
      relatedCells={step.split ? [{ row: 0, column: step.split }] : []}
      columnLabels={step.dp.map((_, k) => k)} />
    <output aria-label="Current split">{step.split ? `Copy at key ${step.split}; paste ${step.index - step.split - 1} times` : `Key ${step.index} of ${run.input}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why a copy can win:</strong> one copy-select-all followed by repeated pastes multiplies the screen length while pasting costs one press each.</p>
  </>} />
}
