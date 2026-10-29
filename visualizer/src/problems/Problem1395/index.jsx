import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, pythonLineMap } from './algorithm'

const definition = {
  phases: [
    { id: 'init', label: 'Setup', description: 'Start with no teams counted.' },
    { id: 'scan', label: 'Middle', description: 'Choose each soldier as the middle member of a team.' },
    { id: 'count', label: 'Count sides', description: 'Count smaller and larger ratings on the left and right.' },
    { id: 'add', label: 'Add teams', description: 'Add the increasing and decreasing teams centred on this soldier.' },
    { id: 'done', label: 'Result', description: 'Report the total number of teams.' },
  ],
  parse: parseInput, build: buildTrace, code, python, pythonLineMap,
  inputLabel: 'Ratings (JSON object with rating)',
  url: 'https://leetcode.com/problems/count-number-of-teams/',
  complexity: 'O(n²) time and O(1) extra space for n soldiers. The visualization caps input at 50 soldiers.',
  examples: [
    { label: 'Mixed', input: '{"rating":[2,5,3,4,1]}' },
    { label: 'No team', input: '{"rating":[2,1,3]}' },
    { label: 'Increasing', input: '{"rating":[1,2,3,4]}' },
  ],
}

export default function CountNumberOfTeams() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Ratings" length={run.input.rating.length} valueAt={i => run.input.rating[i]}
      active={step.j ?? -1} roleAt={i => (step.j === null || step.j === undefined ? '' : i < step.j ? 'left' : i > step.j ? 'right' : 'middle')} />
    <p>Total teams so far: {step.total}{step.counts ? ` · left <${step.counts.leftLess} >${step.counts.leftGreater} · right <${step.counts.rightLess} >${step.counts.rightGreater}` : ''}</p>
  </>} renderReasoning={({ step }) => <p>{step.message}</p>} />
}
