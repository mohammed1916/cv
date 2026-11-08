import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with an empty choice.' },
    { id: 'pick', label: 'Pick', description: 'Add an interval that fits and score the set.' },
    { id: 'reject', label: 'Reject', description: 'This interval shares a point with a chosen one.' },
    { id: 'done', label: 'Result', description: 'The best set found is reported.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with an intervals list of [start, end, weight] triples',
  url: 'https://leetcode.com/problems/maximum-score-of-non-overlapping-intervals/description/',
  complexity: 'Brute force over index sets of size up to 4; the visualization caps the input at 10 intervals.',
  examples: [
    { label: 'Example', input: '{"intervals":[[1,2,4],[2,3,1],[4,6,3],[5,7,2]]}' },
    { label: 'Tie', input: '{"intervals":[[1,1,5],[2,2,5],[3,3,1]]}' },
    { label: 'Single interval', input: '{"intervals":[[1,1,1]]}' },
    { label: 'Equal weights tie', input: '{"intervals":[[1,3,4],[2,4,4],[3,5,4]]}' },
    { label: 'Wide weights', input: '{"intervals":[[1,50,99],[10,20,1],[50,60,99]]}' },
    { label: 'Long run: 10 intervals', input: '{"intervals":[[17,18,7],[24,28,5],[11,16,5],[26,29,8],[24,30,2],[7,8,5],[5,9,1],[8,12,6],[6,10,8],[14,18,3]]}' },
  ],
}

export default function MaximumScoreNonOverlappingIntervals() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="intervals" length={run.input.intervals.length}
      valueAt={i => `${run.input.intervals[i][0]}-${run.input.intervals[i][1]} w${run.input.intervals[i][2]}`}
      active={step.at}
      roleAt={i => (step.chosen.includes(i) ? 'match' : '')} />
    <output aria-label="Best set so far">{`Chosen [${step.chosen.join(', ')}] · best score ${step.bestScore}${step.best ? ` at [${step.best.join(', ')}]` : ''}`}</output>
  </>} renderReasoning={() => <>
    <p>Intervals that share even one endpoint count as overlapping, so a chosen set must have every pair strictly separated.</p>
    <p>Keep every candidate set of at most four indices, and break score ties by the smaller index list in lexicographic order.</p>
  </>} />
}
