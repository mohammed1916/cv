import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Four digits.' },
    { id: 'invalid', label: 'Invalid', description: 'Hours at least 24 or minutes at least 60.' },
    { id: 'valid', label: 'Valid', description: 'A real time that does not beat the best.' },
    { id: 'better', label: 'New best', description: 'A valid time later than every earlier one.' },
    { id: 'done', label: 'Complete', description: 'Return the best time or an empty string.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Digits (JSON array of 4)',
  url: 'https://leetcode.com/problems/largest-time-for-given-digits/',
  complexity: 'O(4!) = O(1) time and space.',
  examples: [
    { label: 'Example 1', input: '[1,2,3,4]' },
    { label: 'Example 2', input: '[5,5,5,5]' },
    { label: 'With zeros', input: '[0,0,0,0]' },
    { label: 'Boundary: nines', input: '[9,9,9,9]' },
    { label: 'Mixed zeros and nines', input: '[9,0,0,1]' },
    { label: 'Mixed digits', input: '[8,1,9,2]' },
  ],
}

export default function LargestTime() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Ordering as H H : M M" length={4} valueAt={i => step.perm[i]} roleAt={() => step.phase === 'invalid' ? 'dropped' : step.phase === 'better' ? 'match' : ''} />
    <RecordStateTable label="Current ordering read as HH:MM" columns={['hours', 'minutes', 'valid time']} rows={[(() => {
      const [h1, h2, m1, m2] = step.perm
      const hours = h1 * 10 + h2, mins = m1 * 10 + m2
      return { hours: `${h1}${h2} (${hours})`, minutes: `${m1}${m2} (${mins})`, 'valid time': hours < 24 && mins < 60 ? 'yes' : 'no' }
    })()]} />
    <output aria-label="Best time">Best so far: {step.bestText || 'none'}{step.idx ? ` (ordering ${step.idx} of 24)` : ''}</output>
  </>} renderReasoning={() => <>
    <p>A time is the pair (hours, minutes); comparing total minutes since midnight compares times correctly, so it is enough to keep the maximum.</p>
    <p>With four digits there are only 24 orderings, so exhaustive search is simplest and cannot miss the answer.</p>
  </>} />
}
