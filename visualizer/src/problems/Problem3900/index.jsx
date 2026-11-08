import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'totals', label: 'Totals', description: 'Count ones and zeros in the whole string.' },
    { id: 'window', label: 'Windows', description: 'Test each window for a one-swap fix.' },
    { id: 'done', label: 'Result', description: 'Report the longest fixable window.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s, a binary string',
  url: 'https://leetcode.com/problems/longest-balanced-substring-after-one-swap/',
  complexity: 'This visual checks every window: O(n^2) with counting inside each window. A prefix-count scan would be faster for large strings. The visual caps s at 20 characters.',
  examples: [
    { label: 'Example A', input: '{"s":"1001000"}' },
    { label: 'Example B', input: '{"s":"0011"}' },
    { label: 'Single zero', input: '{"s":"0"}' },
    { label: 'Single one', input: '{"s":"1"}' },
    { label: 'Run of zeros', input: '{"s":"0000"}' },
    { label: 'Twenty characters', input: '{"s":"11111111110000000000"}' },
    { label: 'Long run: 20 bits', input: '{"s":"01111100111101010001"}' },
  ],
}

export default function LongestBalancedSubstringAfterOneSwap() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="s" length={run.input.s.length} valueAt={i => run.input.s[i]} active={-1}
      roleAt={i => (step.l < 0 ? '' : i === step.l && i === step.r ? 'l = r' : i === step.l ? 'l' : i === step.r ? 'r' : i > step.l && i < step.r ? (step.fixable ? 'window' : 'excluded') : '')} />
    <output aria-label="Window status">{`Best ${step.best}. ${step.message}`}</output>
  </>} renderReasoning={() => <>
    <p>A single swap changes the balance by at most two, so a window is fixable when it is already balanced, or it is two characters off and the matching character sits outside the window.</p>
    <p>The window count is then the answer, and the swap is only used when it is needed.</p>
  </>} />
}
