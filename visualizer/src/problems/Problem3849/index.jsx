import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'setup', label: 'Count', description: 'Count the ones and zeros of t.' },
    { id: 'position', label: 'Position', description: 'Choose the digit for this position.' },
    { id: 'done', label: 'Result', description: 'Report the maximum XOR.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s and t (binary strings of equal length)',
  url: 'https://leetcode.com/problems/maximum-bitwise-xor-after-rearrangement/',
  complexity: 'One pass with counts, so O(n) time. The visual caps the strings at 16 digits.',
  examples: [
    { label: 'Example', input: '{"s":"0011","t":"1101"}' },
    { label: 'All ones', input: '{"s":"1010","t":"1111"}' },
    { label: 'One bit', input: '{"s":"0","t":"1"}' },
    { label: 'Equal strings', input: '{"s":"1111","t":"1111"}' },
    { label: 'Sixteen bits, opposite', input: '{"s":"0000000000000000","t":"1111111111111111"}' },
    { label: 'Long run: 16 bits', input: '{"s":"1100011000110110","t":"1001100010101001"}' },
  ],
}

export default function MaximumBitwiseXorAfterRearrangement() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="s (fixed)" length={run.input.s.length} valueAt={i => run.input.s[i]} active={step.i}
      roleAt={i => (i < step.chosen.length ? 'done' : '')} />
    <IndexedSequence label="t digits used" length={step.chosen.length} valueAt={i => step.chosen[i]} active={step.chosen.length - 1} />
    <output aria-label="Counts">{`Ones left in t: ${step.ones} · zeros left: ${step.zeros} · result so far: ${step.result.join('')}`}</output>
  </>} renderReasoning={() => <>
    <p>The leftmost bit matters most, so each position is decided from left to right and makes that bit a one whenever a suitable digit remains.</p>
    <p>Every choice keeps the counts of ones and zeros of t consistent, so the greedy choice never blocks a later position.</p>
  </>} />
}
