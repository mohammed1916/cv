import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start run', description: 'The first element begins a run.' },
    { id: 'grow', label: 'Grow run', description: 'The next value is strictly larger.' },
    { id: 'reset', label: 'Restart run', description: 'The next value does not increase.' },
    { id: 'done', label: 'Complete', description: 'Return the longest run.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Array nums (JSON)',
  url: 'https://leetcode.com/problems/longest-continuous-increasing-subsequence/',
  complexity: 'O(n) time and O(1) extra space.',
  examples: [
    { label: 'Two runs', input: '[1,3,5,4,7]' },
    { label: 'All equal', input: '[2,2,2,2,2]' },
    { label: 'Long', input: '[1,3,5,7]' },
  ],
}

export default function LongestRun() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Values" length={run.input.length} active={step.index} valueAt={i => run.input[i]}
      roleAt={i => (i <= step.index && i > step.index - step.run ? 'in-run' : '')} />
    <output aria-label="Run">Current run {step.run} · best {step.best}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Strictly:</strong> equal neighbours break a run, which is why the restart condition is "not greater" rather than "smaller".</p>
  </>} />
}
