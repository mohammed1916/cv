import withProblemStory from '../../components/shared/withProblemStory';
import storyGuide from './storyGuide.json';
import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace';
import IndexedSequence from '../../components/shared/IndexedSequence';
import { buildTrace, parseInput, code, python, pythonLineMap, phases } from './algorithm';

const definition = {
  parse: parseInput, build: buildTrace, code, python, pythonLineMap, phases,
  inputLabel: 'Values and maxStep as a JSON object',
  url: 'https://leetcode.com/problems/jump-game-vi/',
  complexity: 'O(n) time and O(n) space: each index enters and leaves the candidate deque at most once.',
  examples: [
    { label: 'Mixed signs', input: '{"values": [1, -1, -2, 4, -7, 3], "maxStep": 2}' },
    { label: 'Long jump allowed', input: '{"values": [10, -5, -2, 4, 0, 3], "maxStep": 3}' },
    { label: 'Single step', input: '{"values": [2, 6, -4, 5], "maxStep": 1}' },
  ],
}

function JumpWindow() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { i, deque, current, expired, result } = step.snapshot
    const candidates = new Set(deque.map(entry => entry.index))
    return <>
      <IndexedSequence label="Values and candidate windows" length={run.input.values.length}
        active={Math.min(i, run.input.values.length - 1)} valueAt={index => run.input.values[index]}
        roleAt={index => (index === i ? 'current' : candidates.has(index) ? 'candidate' : expired.includes(index) ? 'dropped' : '')} />
      <section aria-label="Candidate deque">
        <h3>Candidate deque (front to back)</h3>
        <ol>{deque.map(entry => <li key={entry.index}>index {entry.index}, score {entry.score}</li>)}</ol>
        <p>Allowed previous range: indices {Math.max(0, i - run.input.maxStep)} to {Math.max(0, i - 1)}.</p>
        {current !== null && current !== undefined && <p>Score at index {i}: {current}</p>}
      </section>
      {step.phase === 'done' && <output aria-label="Best final score">Best final score: {result}</output>}
    </>
  }} renderReasoning={() => <>
    <p>The score at an index is its value plus the best score among the previous positions it can jump from. Only the last maxStep indices matter.</p>
    <p>The deque keeps candidates in decreasing score order. A newer index with a higher score makes older, weaker candidates useless, so they are removed from the back. Expired indices leave from the front.</p>
  </>} />
}

export default withProblemStory(JumpWindow, storyGuide);
