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
  question: "Find the fewest deletions or additions needed to make a digit string divisible by 25 by removing digits.",
  approaches: [
    { name: "Check the four valid endings", intuition: "A number is divisible by 25 when it ends in 00, 25, 50 or 75; find the cheapest way to form each ending.", time: "O(n)", space: "O(1)" },
    { name: "Try all removal subsets", intuition: "Try removing each subset of digits and test divisibility.", time: "O(2^n)", space: "O(n)" },
  ],
  examples: [
    { label: 'Ends in 75', input: '{"num":"7315"}' },
    { label: 'Zero and no pair', input: '{"num":"9045"}' },
    { label: "Single digit", input: "{\"num\":\"5\"}" },
    { label: "Zero", input: "{\"num\":\"0\"}" },
    { label: "Fourteen digits", input: "{\"num\":\"98765432109876\"}" },
    { label: "Long run: 14 seeded digits", input: "{\"num\":\"12321214783096\"}" },
  ],
}

export default function MinimumOperationsSpecial() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="num" length={run.input.num.length} valueAt={i => run.input.num[i]} active={step.p >= 0 ? step.p : -1}
      roleAt={i => (i === step.q ? 'l keep' : i === step.p ? 'r keep' : '')} />
    <output aria-label="Deletion count">{`ending = ${step.pair ?? 'none'}, best deletions = ${step.best}`}</output>
  </>} renderReasoning={() => <>
    <p>A number is divisible by 25 exactly when it ends in 00, 25, 50 or 75, or it is the single digit 0. Each ending is tested independently.</p>
    <p>For an ending ab, the digits kept are everything up to a, plus a and b, so the deletion count is n minus 2 minus the position of a. Choosing the last usable a gives the fewest deletions.</p>
  </>} />
}
