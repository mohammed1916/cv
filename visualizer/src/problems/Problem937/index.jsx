import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Logs in their original order.' },
    { id: 'classify', label: 'Classify', description: 'Decide whether each log is a letter-log or a digit-log.' },
    { id: 'sort', label: 'Sort letters', description: 'Order letter-logs by content then identifier.' },
    { id: 'done', label: 'Complete', description: 'Concatenate letter-logs and digit-logs.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Logs (JSON array of strings)',
  url: 'https://leetcode.com/problems/reorder-data-in-log-files/',
  complexity: 'O(n log n * m) time for n logs of length m. The visualization caps input at 30 logs.',
  examples: [
    { label: 'Example 1', input: '["dig1 8 1 5 1","let1 art can","dig2 3 6","let2 own kit dig","let3 art zero"]' },
    { label: 'Example 2', input: '["a1 9 2 3 1","g1 act car","zo4 4 7","ab1 off key dog","a8 act zoo"]' },
  ],
}

export default function ReorderLogFiles() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Logs" length={step.order.length} active={step.index ?? -1} valueAt={i => step.order[i]}
      roleAt={i => step.kinds[i] === 'letter' ? 'match' : step.kinds[i] === 'digit' ? 'dropped' : ''} />
  </>} renderReasoning={() => <>
    <p>Letter logs compare by everything after the identifier; the identifier only breaks ties. Digit logs are never compared, so a stable partition keeps their order.</p>
    <p>Keying each letter log as (content, identifier, original) lets one plain sort implement both rules.</p>
  </>} />
}
