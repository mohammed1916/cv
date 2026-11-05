import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '2243',
  phases: [
    { id: 'setup', label: 'Start', description: 'Start with the digit string.' },
    { id: 'group', label: 'Group', description: 'Cut the string into groups of k and sum each group.' },
    { id: 'merge', label: 'Merge', description: 'Join the group sums into a new string.' },
    { id: 'done', label: 'Result', description: 'The string fits within k, so it is the answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"s": "1234567", "k": 3}',
  url: 'https://leetcode.com/problems/calculate-digit-sum-of-a-string/',
  complexity: 'O(L * rounds) time for a string of length L. Each round shrinks the string by a factor of about k.',
  examples: [
    { label: 'Example', input: '{"s":"1234567","k":3}' },
    { label: 'Two digits', input: '{"s":"8745","k":2}' },
  ],
}

export default function DigitSumRounds() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label={step.round === 0 ? 'digits' : `digits after round ${step.round}`} length={step.current.length} valueAt={i => step.current[i]}
      active={step.at ?? -1} roleAt={i => `group ${Math.floor(i / run.input.k) + 1}`} />
    <ol aria-label="Group sums">
      {step.groups.map((g, i) => <li key={i}>{`${g.part} = ${g.sum}`}</li>)}
    </ol>
    <p role="status">{step.message}</p>
  </>} renderReasoning={() => <>
    <p>Each round replaces every group of k digits with its digit sum, keeps the groups in order, and joins them. The string shrinks each round.</p>
    <p>The process stops when the string is no longer longer than k.</p>
  </>} />
}
