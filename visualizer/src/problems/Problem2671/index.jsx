import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with no values held.' },
    { id: 'add', label: 'Add', description: 'Move a value up one count.' },
    { id: 'deleteOne', label: 'Delete one', description: 'Move a held value down one count.' },
    { id: 'hasFrequency', label: 'Query', description: 'Ask whether any value has exactly this count.' },
    { id: 'done', label: 'Complete', description: 'All commands have been answered.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array of [op, value] commands (op: add, deleteOne or hasFrequency; values 1 to 5)',
  url: 'https://leetcode.com/problems/frequency-tracker/',
  complexity: 'O(1) per operation with a count map and a count-of-counts map. The visualization caps input at 12 commands.',
  examples: [
    { label: 'Example 1', input: '[["add",3],["add",3],["hasFrequency",2],["hasFrequency",1],["deleteOne",3],["hasFrequency",2]]' },
    { label: 'Absent delete', input: '[["deleteOne",4],["hasFrequency",1]]' },
  ],
}

export default function FrequencyTracker() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="commands" length={run.input.length} valueAt={i => run.input[i][0]} active={step.index ?? -1}
      roleAt={i => (i < step.index ? 'done' : '')} />
    <p aria-label="Counts">{`Counts: ${Object.entries(step.counts ?? {}).map(([v, c]) => `${v} x${c}`).join(', ') || '(none)'}`}</p>
    <output aria-label="Status">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Two tables answer every command in constant time: one maps each value to its count, and one maps each count to how many values have it.</p>
    <p>A query asks whether the count-of-counts table has any entry for the requested frequency.</p>
  </>} />
}
