import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'window', label: 'Rest', description: 'The array left after the removals so far.' },
    { id: 'scan', label: 'Scan', description: 'Check each value of the rest for a repeat.' },
    { id: 'dup', label: 'Repeat', description: 'A repeat means three more front elements go.' },
    { id: 'done', label: 'Result', description: 'The rest has no repeats, or it is empty.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON list of 1 to 12 integers',
  url: 'https://leetcode.com/problems/minimum-number-of-operations-to-have-distinct-elements/',
  complexity: 'O(n) time with a hash set per check. The loop runs at most n / 3 + 1 times.',
  examples: [
    { label: 'Repeat at the front', input: '[5, 1, 5, 7, 2]' },
    { label: 'All distinct', input: '[10, 20, 30, 40]' },
  ],
}

export default function MinimumOperationsDistinctElements() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.length} valueAt={i => run.input[i]} active={step.at >= 0 ? step.at : step.start >= 0 ? step.start : -1}
      roleAt={i => (step.start >= 0 && i >= step.start ? 'window' : '')} />
    <output aria-label="Distinct operation state">{`operations ${step.ops}, rest starts at ${step.start >= 0 ? step.start : 'none'}`}</output>
  </>} renderReasoning={() => <>
    <p>Each operation removes the first three values, so the rest of the array is always a suffix. The question is the first suffix that has no repeated value.</p>
    <p>A suffix that begins past the end is empty, which also counts as having no duplicates.</p>
  </>} />
}
