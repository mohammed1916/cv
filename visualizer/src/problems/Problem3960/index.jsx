import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import FrequencyWindowView from './FrequencyWindowView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No balanced subarray is recorded yet.' },
    { id: 'start-index', label: 'Start index', description: 'Begin a window at this index.' },
    { id: 'extend', label: 'Extend', description: 'Add the next value and read the frequency levels.' },
    { id: 'record', label: 'Record', description: 'The window qualifies and may set a new best.' },
    { id: 'done', label: 'Result', description: 'Report the longest qualifying length.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON array of integers (e.g. [1,1,2,2,2])',
  url: 'https://leetcode.com/problems/frequency-balance-subarray/',
  complexity: 'O(n^2) for the visual scan. The frequency check is O(distinct values) per window.',
  examples: [
    { label: 'Levels one and two', input: '[1,1,2,2,2]' },
    { label: 'Single value', input: '[7,7,7,3]' },
  ],
}

export default function FrequencyBalanceSubarray() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <FrequencyWindowView run={run} step={step} />} renderReasoning={({ run, step }) => (
    <p>{step.message} {run ? `Longest qualifying length: ${run.result}.` : ''}</p>
  )} />
}
