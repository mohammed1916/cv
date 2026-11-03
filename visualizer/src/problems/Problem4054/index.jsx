import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import ShadowSkylineView from './ShadowSkylineView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '4054',
  phases: [
    { id: 'start', label: 'Start', description: 'No pairs counted yet.' },
    { id: 'anchor', label: 'Anchor', description: 'Pick a left element and scan right.' },
    { id: 'pair', label: 'Pair', description: 'A later value is larger and nothing passed is smaller.' },
    { id: 'scan', label: 'Scan', description: 'This later value does not form a pair.' },
    { id: 'block', label: 'Blocker', description: 'Track the smallest value passed so far.' },
    { id: 'stop', label: 'Stop', description: 'A smaller value ends this anchor.' },
    { id: 'done', label: 'Result', description: 'Report the pair count.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON array of integers, e.g. [3, 1, 4, 1, 5]',
  url: 'https://leetcode.com/problems/count-shadow-pairs-i/description/',
  complexity: 'O(n^2) time and O(1) extra space in this scan. The visualization caps the array at 16 values; the official limit is 100000.',
  examples: [
    { label: 'Smaller value blocks', input: '[2, 1, 3]' },
    { label: 'Equal values pass', input: '[3, 5, 3, 7]' },
  ],
}

export default function CountShadowPairsIVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <ShadowSkylineView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          {step.message} {run ? `Final count: ${run.result}.` : ''}
        </p>
      )}
    />
  )
}
