import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No characters read yet; the cheapest state is (0, 0).' },
    { id: 'scan', label: 'Read', description: 'Try both characters at this position and keep the cheapest state for each progress pair.' },
    { id: 'done', label: 'Return', description: 'The cheapest state after the last character is the answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON: {"s": "binary string"}',
  url: 'https://leetcode.com/problems/minimum-flips-to-make-binary-string-coherent/',
  complexity: 'O(n) time and O(1) extra space, since there are at most nine progress pairs. The visualization caps s at 12 characters.',
  examples: [
    { label: 'Example 1', input: '{"s":"1010"}' },
    { label: 'Example 2', input: '{"s":"0110"}' },
    { label: 'Example 3', input: '{"s":"1000"}' },
  ],
}

export default function MinimumFlipsCoherent() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Original string" length={run.input.s.length} valueAt={j => run.input.s[j]} active={step.i} />
    <output aria-label="Progress states">{`Progress pairs (011, 110) and fewest flips: ${step.best.map(([k, c]) => `(${k}) ${c}`).join(', ') || 'none'}`}</output>
    <output aria-label="Step message">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>A string avoids 011 and 110 as subsequences exactly when neither pattern is completed by greedy matching, so the matching progress is a complete summary of the prefix.</p>
    <p>Only the cheapest flip count per progress pair matters, which keeps the table tiny.</p>
  </>} />
}
