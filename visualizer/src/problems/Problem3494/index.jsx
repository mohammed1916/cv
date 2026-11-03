import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'prefix', label: 'Skills', description: 'Add up the wizard skills so each wizard has a running load.' },
    { id: 'gap', label: 'Gap', description: 'Find how late this potion must start for every wizard to be free.' },
    { id: 'start', label: 'Start', description: 'Fix the start time of this potion.' },
    { id: 'done', label: 'Result', description: 'Add the last potion’s pass through every wizard.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with skill and mana arrays',
  url: 'https://leetcode.com/problems/find-the-minimum-amount-of-time-to-brew-potions/',
  complexity: 'O(n * m) time and O(n + m) space for n wizards and m potions.',
  examples: [
    { label: 'Example', input: '{"skill":[2,3,1],"mana":[4,2]}' },
    { label: 'One potion', input: '{"skill":[3,1],"mana":[2]}' },
  ],
}

export default function FindTheMinimumAmountOfTimeToBrewPotions() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Potion start time" length={run.input.mana.length} valueAt={i => step.start[i] ?? '—'}
      active={step.potion >= 0 ? step.potion : 0} roleAt={i => (i < step.start.length ? 'started' : '')} />
    <output aria-label="Brewing state">{step.result !== null ? `Total time ${step.result}` : `Potion ${Math.max(0, step.potion)}, wizard ${step.wizard >= 0 ? step.wizard : '-'}`}</output>
  </>} renderReasoning={() => <>
    <p>Each wizard handles one potion at a time, and a potion moves on immediately. So potion j can begin only late enough that, for every wizard, the previous potion has already left that wizard.</p>
    <p>The prefix sums turn each wizard’s workload into a cumulative boundary, so every check is a single expression rather than a simulation.</p>
  </>} />
}
