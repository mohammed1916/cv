import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import WindowDpView from './WindowDpView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '3995',
  phases: [
    { id: 'start', label: 'Setup', description: 'Cost 0 at the empty prefix.' },
    { id: 'skip', label: 'Skip', description: 'An unreachable position cannot start a window.' },
    { id: 'position', label: 'Position', description: 'Expand from a reachable position.' },
    { id: 'keep', label: 'Keep', description: 'Leave a matching letter untouched for free.' },
    { id: 'apply', label: 'Apply', description: 'A rule fits and reaches a later position.' },
    { id: 'reject', label: 'Reject', description: 'A rule does not fit this window.' },
    { id: 'done', label: 'Result', description: 'Report the minimum cost or -1.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with source, target and rules ({"pattern","replacement","cost"})',
  url: 'https://leetcode.com/problems/minimum-cost-to-convert-string-iii/',
  complexity: 'O(n * r * L) time and O(n) space for n letters, r rules and pattern length L. The visualization caps the string at 12 letters and the rules at 6.',
  examples: [
    { label: 'Wildcard window', input: '{"source":"abcd","target":"xyzd","rules":[{"pattern":"a*","replacement":"xy","cost":2},{"pattern":"c","replacement":"z","cost":1}]}' },
    { label: 'Two single letters', input: '{"source":"aaa","target":"xyz","rules":[{"pattern":"a","replacement":"x","cost":1},{"pattern":"a*","replacement":"yz","cost":2}]}' },
    { label: 'Impossible', input: '{"source":"ab","target":"ba","rules":[{"pattern":"a","replacement":"b","cost":1}]}' },
  ],
}

export default function MinimumCostConvertString() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <WindowDpView run={run} step={step} />}
    renderReasoning={({ step }) => <>
      <p>{step.message}</p>
      <p>Each dp entry is the cheapest way to finish a prefix; a rule jumps forward over its window, so windows never overlap.</p>
    </>} />
}
