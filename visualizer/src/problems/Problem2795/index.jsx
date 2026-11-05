import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Launch', description: 'All tasks start before any finishes.' },
    { id: 'step', label: 'Finish', description: 'Each task writes into its own slot.' },
    { id: 'done', label: 'Result', description: 'Results follow the input order.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with a tasks array of { value, delay } entries',
  url: 'https://leetcode.com/problems/parallel-execution-of-promises-for-individual-results-retrieval/',
  complexity: 'O(n log n) here because the visual sorts tasks by delay. The real work is O(n).',
  examples: [
    { label: 'Out of order', input: '{"tasks":[{"value":"slow","delay":90},{"value":"fast","delay":10},{"value":"mid","delay":40}]}' },
  ],
}

export default function ParallelPromiseResults() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Result slots" length={step.out.length} valueAt={i => step.out[i]} active={step.at}
      roleAt={i => (i === step.at ? 'finished now' : step.out[i] === '…' ? 'waiting' : 'filled')} />
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Completion order is different from input order, so each result is stored at its own index instead of being appended.</p>
  </>} />
}
