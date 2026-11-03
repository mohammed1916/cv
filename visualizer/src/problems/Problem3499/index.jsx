import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'runs', label: 'Runs', description: 'Split the string into runs of equal characters.' },
    { id: 'trade', label: 'Trade', description: 'Score the zero runs around one run of ones.' },
    { id: 'done', label: 'Result', description: 'Add the best gain to the active sections already present.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with a binary string s',
  url: 'https://leetcode.com/problems/maximize-active-section-with-trade-i/',
  complexity: 'O(n) time and O(n) space for a string of length n.',
  examples: [
    { label: 'Example', input: '{"s":"0011010"}' },
    { label: 'All ones', input: '{"s":"111"}' },
  ],
}

export default function MaximizeActiveSectionWithTradeI() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Runs" length={step.runs.length} valueAt={i => `${step.runs[i].ch}×${step.runs[i].len}`}
      active={step.run >= 0 ? step.run : -1}
      roleAt={i => (step.run >= 0 && (i === step.run - 1 || i === step.run + 1) ? 'zeros' : '')} />
    <output aria-label="Trade state">{step.result !== null ? `Active sections ${step.result}` : `Ones ${step.total}, best gain ${step.best}`}</output>
  </>} renderReasoning={() => <>
    <p>A trade converts one run of ones into zeros and then fills the zeros it created, together with both neighbouring zero runs, with ones.</p>
    <p>So the net gain from a run of ones is the length of the zero run on its left plus the zero run on its right.</p>
  </>} />
}
