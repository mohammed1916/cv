import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'
import DebounceView from './DebounceView'

const definition = {
  number: '2627',
  phases: [
    { id: 'call', label: 'Call', description: 'Look at the next call time.' },
    { id: 'skip', label: 'Skip', description: 'A later call replaces this one.' },
    { id: 'run', label: 'Schedule', description: 'This call is the last of its burst.' },
    { id: 'done', label: 'Result', description: 'Run times.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with wait (milliseconds) and calls (sorted call times)',
  url: 'https://leetcode.com/problems/debounce/',
  complexity: 'O(k) time for k calls, O(k) space for the run list.',
  examples: [
    { label: 'Burst', input: '{"wait":100,"calls":[0,50,120,300]}' },
    { label: 'Same time', input: '{"wait":5,"calls":[10,10,10]}' },
  ],
}

export default function Debounce() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <DebounceView view={step.view} />}
    renderReasoning={() => <>
      <p>Each call cancels the pending run and starts a new wait. Only a call followed by a quiet gap of at least the wait time actually runs.</p>
    </>} />
}
