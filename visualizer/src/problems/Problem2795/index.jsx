import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'

const code = `run every task at the same time
  results = array with one slot per task
  for each task i, when it finishes
    results[i] = its value
  when all tasks are finished, return results`
const python = `def run_all(tasks):
    results = [None] * len(tasks)
    # tasks run concurrently; each finish writes to its own index
    for i, (value, delay) in enumerate(tasks):
        results[i] = value
    return results`

function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.tasks) || input.tasks.some(t => typeof t.delay !== 'number' || t.delay < 0)) {
    throw new Error('Use { "tasks": [{ "value": ..., "delay": ms }, ...] } with non-negative delays.')
  }
  return input
}

function buildTrace({ tasks }) {
  const results = Array(tasks.length).fill(null)
  const frames = [{ phase: 'start', activeLine: 1, message: `Start ${tasks.length} task(s) together.`, at: -1, out: [...results] }]
  const order = tasks.map((t, i) => i).sort((a, b) => tasks[a].delay - tasks[b].delay || a - b)
  for (const i of order) {
    results[i] = tasks[i].value
    frames.push({ phase: 'step', activeLine: 4, message: `Task ${i} finishes at ${tasks[i].delay} ms and fills slot ${i}.`, at: i, out: results.map(v => v ?? '…') })
  }
  frames.push({ phase: 'done', activeLine: 5, message: 'All results are in their original order.', at: -1, out: results.map(v => v ?? '…') })
  return { frames }
}

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
    <IndexedSequence label="Result slots" length={step.out.length} valueAt={i => step.out[i]} active={step.at} />
  </>} renderReasoning={() => <>
    <p>Completion order is different from input order, so results are stored by index instead of appended.</p>
    <p>The overall call is finished when the last slot is filled.</p>
  </>} />
}
