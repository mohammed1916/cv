import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Delete all', description: 'Deleting every digit is the baseline.' },
    { id: 'zero', label: 'Zero', description: 'A single 0 is already special.' },
    { id: 'pair', label: 'Ending', description: 'Look for this two-digit ending.' },
    { id: 'found', label: 'Keep', description: 'Keep the pair and everything before it.' },
    { id: 'done', label: 'Result', description: 'Report the fewest deletions.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with num (a string of digits)',
  url: 'https://leetcode.com/problems/minimum-operations-to-make-a-special-number/',
  complexity: 'O(n) time for four endings, each with two backward scans, and O(1) extra space.',
  examples: [
    { label: 'Example 1', input: '{"num":"2245"}' },
    { label: 'Example 2', input: '{"num":"100"}' },
  ],
}

export default function MinimumOperationsSpecial() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="num" length={run.input.num.length} valueAt={i => run.input.num[i]} active={step.p >= 0 ? step.p : -1}
      roleAt={i => (i === step.q ? 'window' : '')} />
    <output aria-label="Deletion count">{`ending = ${step.pair ?? 'none'}, best deletions = ${step.best}`}</output>
  </>} renderReasoning={() => <>
    <p>A number is divisible by 25 exactly when it ends in 00, 25, 50 or 75, or it is the single digit 0. Each ending is tested independently.</p>
    <p>For an ending ab, the digits kept are everything up to a, plus a and b, so the deletion count is n minus 2 minus the position of a. Choosing the last usable a gives the fewest deletions.</p>
  </>} />
}
