import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with no segment and no best answer.' },
    { id: 'slide', label: 'Slide', description: 'Move the left end of the segment until its prizes fit within k.' },
    { id: 'record', label: 'Record', description: 'Add the best segment that finishes before this one to this segment.' },
    { id: 'done', label: 'Complete', description: 'Report the most prizes two segments can cover.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with a sorted array prize_positions (up to 40 values from 0 to 50) and k, for example {"prize_positions":[1,1,2,2,3,3,5],"k":2}',
  url: 'https://leetcode.com/problems/maximize-win-from-two-segments/',
  complexity: 'O(n) time with two pointers and one array of best prefixes. The visualization caps the prizes at 40.',
  examples: [
    { label: 'Example 1', input: '{"prize_positions":[1,1,2,2,3,3,5],"k":2}' },
    { label: 'Example 2', input: '{"prize_positions":[1,2,3,4],"k":0}' },
  ],
}

export default function MaximizeWinTwoSegments() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Prize positions" length={run.input.prize_positions.length} valueAt={index => run.input.prize_positions[index]} active={step.right}
      roleAt={index => (step.right >= 0 && step.left <= index && index <= step.right ? 'segment' : '')} />
    <output aria-label="Segment totals">{step.right < 0 ? 'No prizes scanned yet' : `Segment covers ${step.covered || step.right - step.left + 1}, best before it ${step.before}. Best answer: ${step.answer}`}</output>
  </>} renderReasoning={() => <>
    <p>Prizes are sorted, so each segment covers a contiguous run of prizes. A segment that starts at prize i and ends at the last prize within k of it is the most it can cover.</p>
    <p>For the second segment, it is enough to use the best segment that ends before the first one starts. Counting both in one pass gives the answer.</p>
  </>} />
}
