import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import ShadowCeilingView from './ShadowCeilingView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '4055',
  phases: [
    { id: 'start', label: 'Start', description: 'No pairs counted yet.' },
    { id: 'anchor', label: 'Anchor', description: 'Pick a left element and scan right.' },
    { id: 'pair', label: 'Pair', description: 'Nothing passed lies strictly between the endpoints.' },
    { id: 'blocked', label: 'Blocked', description: 'A value strictly between the endpoints was passed.' },
    { id: 'scan', label: 'Scan', description: 'This value is not above the anchor.' },
    { id: 'ceiling', label: 'Ceiling', description: 'Lower the ceiling to the newest value above the anchor.' },
    { id: 'done', label: 'Result', description: 'Report the pair count.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON array of integers, e.g. [1, 2, 3, 5]',
  url: 'https://leetcode.com/problems/count-shadow-pairs-ii/description/',
  complexity: 'O(n^2) time and O(1) extra space in this scan. The visualization caps the array at 16 values; the official limit is 50000.',
  examples: [
    { label: 'Middle value blocks', input: '[1, 2, 3]' },
    { label: 'Endpoint values pass', input: '[2, 4, 2, 4]' },
    { label: "Equal ends", input: "[5,2,5]" },
    { label: "Equal values", input: "[3,3,3]" },
    { label: "Largest values", input: "[1000000000,1,1000000000]" },
    { label: "Long run: 16 values", input: "[91148031,806581277,484814563,483728541,60371487,192024756,226967000,924014098,84500901,942990952,116206028,381159318,941409807,792778909,230676688,994401411]" },
  ],
}

export default function CountShadowPairsIIVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <ShadowCeilingView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          {step.message} {run ? `Final count: ${run.result}.` : ''}
        </p>
      )}
    />
  )
}
