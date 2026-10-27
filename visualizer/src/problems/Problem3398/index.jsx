import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import AnswerRangeBar from '../../components/shared/AnswerRangeBar'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Bounds', description: 'Set the search bounds for the longest run.' },
    { id: 'probe', label: 'Count flips', description: 'Find the fewest flips that keep every run within the candidate length.' },
    { id: 'done', label: 'Answer', description: 'Report the smallest possible longest run.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s (a binary string of 1 to 10 characters) and numOps (JSON)',
  url: 'https://leetcode.com/problems/smallest-substring-with-identical-characters-i/',
  complexity: 'O(n * L) time for each candidate length L, with binary search over L. The visualization caps the input at 10 characters.',
  examples: [
    { label: 'Example 1', input: '{"s":"000001","numOps":1}' },
    { label: 'Example 2', input: '{"s":"0000","numOps":2}' },
  ],
}

export default function SmallestIdenticalSubstringOne() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <AnswerRangeBar title="Run length search" min={run.domain[0]} max={run.domain[1]} low={step.lo} high={step.hi} probe={step.mid} verdict={step.verdict} />
    <output aria-label="Flips needed at this length">{step.cost === null ? 'Not yet counted' : `Flips needed for runs of at most ${step.mid ?? step.lo}: ${step.cost} (allowed ${run.input.numOps})`}</output>
  </>} renderReasoning={() => <>
    <p>Each character is either kept or flipped. A dynamic program tracks the cheapest way to end at each character with each final run length, so no run exceeds the candidate.</p>
    <p>The cheapest count is exact for each candidate, and a longer allowed run never needs more flips, so binary search applies.</p>
  </>} />
}
