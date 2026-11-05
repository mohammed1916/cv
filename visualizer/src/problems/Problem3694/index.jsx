import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'scan', label: 'Windows', description: 'Remove each window and read its endpoint.' },
    { id: 'done', label: 'Result', description: 'The count of distinct endpoints.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s (letters U D L R) and k',
  url: 'https://leetcode.com/problems/distinct-points-reachable-after-substring-removal/',
  complexity: 'O(n) prefix work plus O(n) set operations on the window endpoints.',
  examples: [
    { label: 'Example', input: '{"s":"RRUDL","k":2}' },
    { label: 'Repeats', input: '{"s":"UUDD","k":2}' },
  ],
}

export default function DistinctPointsAfterSubstringRemoval() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="moves" length={run.input.s.length} valueAt={i => run.input.s[i]} active={step.at}
      roleAt={i => (step.window && i === step.window[0] ? 'l' : step.window && i === step.window[1] ? 'r' : step.window && i > step.window[0] && i < step.window[1] ? 'removed' : '')} />
    <output aria-label="Endpoint">{step.point ? `endpoint (${step.point[0]}, ${step.point[1]}), ${step.fresh ? 'new' : 'repeat'}; distinct ${step.distinct}` : `distinct endpoints: ${step.distinct}`}</output>
  </>} renderReasoning={() => <>
    <p>Removing a window is the same as keeping the moves before it and the moves after it. The position before the window and the displacement after it can be read from prefix positions.</p>
    <p>Each window start therefore yields one endpoint, and the answer is how many of those are different.</p>
  </>} />
}
