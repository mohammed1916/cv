import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'signs', label: 'Signs', description: 'Reduce nums to up, equal and down steps.' },
    { id: 'fail', label: 'Failure table', description: 'Precompute the pattern’s fallback positions.' },
    { id: 'scan', label: 'Scan', description: 'Match signs against the pattern.' },
    { id: 'match', label: 'Match', description: 'A full pattern match ends here.' },
    { id: 'done', label: 'Result', description: 'Report the number of matching subarrays.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (integers -5 to 5) and pattern (-1, 0, 1 entries)',
  url: 'https://leetcode.com/problems/number-of-subarrays-that-match-a-pattern-ii/',
  complexity: 'O(n + m) time with KMP, O(m) extra space. The visualization caps nums at 12 values.',
  examples: [
    { label: 'Example', input: '{"nums":[1,4,4,1,3,5,5,3],"pattern":[1,0,-1]}' },
    { label: 'Run', input: '{"nums":[1,2,3,4,5],"pattern":[1,1]}' },
  ],
}

export default function MatchingSubarrays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const signs = []
    for (let i = 0; i + 1 < run.input.nums.length; i++) signs.push(Math.sign(run.input.nums[i + 1] - run.input.nums[i]))
    return <>
      <IndexedSequence label="Signs of adjacent differences" length={signs.length} valueAt={i => signs[i]} active={step.index}
        roleAt={i => (i === step.index && step.phase === 'match' ? 'match' : '')} />
      <output aria-label="KMP state">{`Pattern matched so far: ${step.k} of ${run.input.pattern.length}; matches: ${step.matches}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>A subarray matches exactly when its adjacent comparisons equal the pattern, so the problem becomes finding the pattern among the signs.</p>
    <p>KMP reuses the failure table to keep scanning without going back, which also counts overlapping matches.</p>
  </>} />
}
