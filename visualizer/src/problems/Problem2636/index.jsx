import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'
import PoolView from './PoolView'

const definition = {
  number: '2636',
  phases: [
    { id: 'start', label: 'Start tasks', description: 'Fill the pool up to the limit.' },
    { id: 'finish', label: 'Finish', description: 'The earliest running task ends.' },
    { id: 'done', label: 'Result', description: 'Total time.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with limit (1 to 4) and durations (whole milliseconds, up to 8 tasks)',
  url: 'https://leetcode.com/problems/promise-pool/',
  complexity: 'O(n^2) time with this simple list (a heap would give O(n log n)), O(n) space.',
  examples: [
    { label: 'Pool of two', input: '{"limit":2,"durations":[300,100,200,50]}' },
    { label: 'Pool of one', input: '{"limit":1,"durations":[10,20]}' },
  ],
}

export default function PromisePool() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <PoolView view={step.view} />}
    renderReasoning={() => <>
      <p>The pool keeps at most limit tasks in flight. Finishing one frees a slot, and the next waiting task takes it straight away.</p>
      <p>The total time is when the last task ends.</p>
    </>} />
}
