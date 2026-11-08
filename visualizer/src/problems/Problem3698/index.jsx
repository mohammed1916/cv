import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'cut', label: 'Cuts', description: 'Test each cut position.' },
    { id: 'done', label: 'Result', description: 'The smallest valid difference.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON array of integers',
  url: 'https://leetcode.com/problems/split-array-with-minimum-difference/',
  complexity: 'O(n^2) in this direct version: each cut rechecks both parts. Precomputed run lengths would make the checks O(1).',
  examples: [
    { label: 'Example', input: '[2,6,3,1]' },
    { label: 'Short', input: '[1,4,2]' },
    { label: 'Equal pair', input: '[1,1]' },
    { label: 'Alternating extremes', input: '[100,1,100,1]' },
    { label: 'All equal', input: '[7,7,7,7]' },
    { label: 'Long run: 20 values', input: '[78,93,52,71,42,41,92,43,46,85,8,11,22,89,100,91,86,97,96,47]' },
  ],
}

export default function SplitArrayWithMinimumDifference() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={-1}
      roleAt={i => (step.cut < 0 ? '' : i === 0 ? 'l' : i === step.cut ? 'r' : (i < step.cut ? 'left' : 'right'))} />
    <output aria-label="Cut result">{step.cut < 0 ? `best ${step.best}` : `cut after ${step.cut}: ${step.valid ? `difference ${step.diff}` : 'invalid'}; best ${step.best}`}</output>
  </>} renderReasoning={() => <>
    <p>The left part must strictly rise and the right part must strictly fall. Each cut is independent, so every valid cut can be checked and its gap compared.</p>
    <p>When no cut passes both tests, the answer is -1.</p>
  </>} />
}
