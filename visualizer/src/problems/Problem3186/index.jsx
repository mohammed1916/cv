import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty', description: 'No power value is decided yet.' },
    { id: 'power', label: 'Skip or cast', description: 'Compare skipping this power with casting all spells of it.' },
    { id: 'done', label: 'Complete', description: 'Report the maximum total damage.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array of spell powers from 1 to 10 (JSON)',
  url: 'https://leetcode.com/problems/maximum-total-damage-with-spell-casting/',
  complexity: 'O(m^2) time for the direct scan over m distinct powers, and O(m) space. The visualization caps input at 10 spells.',
  examples: [
    { label: 'Example 1', input: '[1,1,3,4]' },
    { label: 'Example 2', input: '[7,1,6,6]' },
  ],
}

export default function SpellDamage() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Distinct powers, smallest first" length={step.vals.length} valueAt={index => step.vals[index]} active={step.i - 1} />
    <IndexedSequence label="Best total using the first i distinct powers" length={step.best.length} valueAt={index => step.best[index]} active={step.i} />
    <output aria-label="Step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Spells with the same power do not block each other, so all of them are cast or none are.</p>
    <p>Casting a power blocks the powers one and two below and above it, so the best choice before it uses only powers at most three below.</p>
  </>} />
}
