import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'
import { batchTutorial } from './tutorial'
import { examples } from './presets.js'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No batch is open yet.' },
    { id: 'add', label: 'Add', description: 'Add the value to the open batch.' },
    { id: 'close', label: 'Close', description: 'Record a full or final batch.' },
    { id: 'done', label: 'Result', description: 'Report every batch sum.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  pythonLineMap: Object.fromEntries(code.map(line => [line.line, line.line])),
  inputLabel: 'Object with values (0 to 9, up to 12 entries) and k (batch size, 1 to 4)',
  complexity: 'O(n) time and O(n/k) space for the batch sums.',
  question: "Split values into consecutive batches of at most k items and report each batch sum.",
  approaches: [
    { name: "Running sum per batch", intuition: "Walk the values once, adding to the open batch and closing it when it is full.", time: "O(n)", space: "O(n / k)" },
  ],
  goal: {
    summary: 'Split the values into consecutive batches of at most k items and report each batch sum. This is similar in spirit to a premium LeetCode problem, not its statement.',
    requirement: [
      'Read the values from left to right. A batch holds at most k consecutive values.',
      'When a batch is full, its sum is recorded and the next value starts a new batch.',
      'Return the list of batch sums in order.',
    ],
    example: 'values = [1, 2, 3, 4, 5] with k = 2 gives batches [1, 2], [3, 4], [5], so the sums are [3, 7, 5].',
  },
  tutorial: batchTutorial,
  examples,
}

export default function QueryBatchingPractice() {
  return <AlgorithmWorkspace definition={definition} tutorial={batchTutorial} renderVisual={({ run, step }) => <>
    <IndexedSequence label="values" length={step.values.length} valueAt={index => step.values[index]} active={step.index}
      roleAt={index => (index <= step.index ? `batch ${step.batchOf[index]}` : '')} />
    <output aria-label="Batch sums">{`Sums so far: [${step.sums.join(', ')}] · open batch ${step.current}`}</output>
  </>} renderReasoning={() => <p>Each batch is closed when it reaches k items, so its sum is complete before the next batch starts.</p>} />
}
