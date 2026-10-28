import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No exams are recorded yet.' },
    { id: 'record', label: 'Record', description: 'Append an exam with its time and score.' },
    { id: 'query', label: 'Query', description: 'Add the scores of exams inside the time range.' },
    { id: 'done', label: 'Complete', description: 'All calls are answered.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with operations and arguments (JSON), for example {"operations":["record","totalScore"],"arguments":[[1,98],[1,1]]}',
  url: 'https://leetcode.com/problems/design-exam-scores-tracker/',
  complexity: 'record is O(1) and totalScore is O(log n) with prefix sums and binary search. The visualization scans the list and caps the calls at 12.',
  examples: [
    { label: 'Example 1', input: '{"operations":["record","totalScore","record","totalScore","totalScore","totalScore","totalScore"],"arguments":[[1,98],[1,1],[5,99],[1,3],[1,5],[3,4],[2,5]]}' },
  ],
}

export default function DesignExamScoresTracker() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <output aria-label="Last call">{step.call < 0 ? 'Waiting for the first call' : `Call ${step.call + 1}: ${step.phase === 'query' ? `returns ${step.output}` : 'records an exam'}`}</output>
    <output aria-label="Answers so far">{`Answers so far: ${step.outputs.map(v => (v === null ? 'null' : v)).join(', ') || 'none'}`}</output>
  </>} renderReasoning={() => <>
    <p>Times arrive in increasing order, so the recorded times form a sorted list. Prefix sums over the scores let a range sum be found in constant time once the two ends are located.</p>
    <p>The visualization shows the call sequence as the design would see it, one call at a time.</p>
  </>} />
}
