import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Two neighbours always form a run of 2.' },
    { id: 'check', label: 'Check window', description: 'Can this window be made arithmetic with one change?' },
    { id: 'found', label: 'Fixable', description: 'This window can be fixed with one change.' },
    { id: 'done', label: 'Complete', description: 'Report the longest window.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array (JSON object with nums)',
  url: 'https://leetcode.com/problems/longest-arithmetic-sequence-after-changing-at-most-one-element/',
  complexity: 'O(n^3) time for this teaching version. The visualization caps input at 30 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[9,7,5,10,1]}' },
    { label: 'Example 2', input: '{"nums":[1,2,6,7]}' },
  ],
}

export default function LongestArithmeticOneChange() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Array" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.b}
      roleAt={i => (step.a >= 0 && i >= step.a && i <= step.b ? 'window' : '')} />
    <output aria-label="Best">{`Window [${step.a}..${step.b}], best ${step.best}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>A window is fixable when one position can be dropped and the rest sit on one integer step. The changed value can then be set to continue that step.</p>
  </>} />
}
