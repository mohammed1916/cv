import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BulbBoard from './BulbBoard'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'All bulbs begin off.' },
    { id: 'toggle', label: 'Toggle', description: 'Flip the bulb named by this entry.' },
    { id: 'done', label: 'Result', description: 'List the bulbs that are on.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with bulbs (integers from 1 to 100)',
  url: 'https://leetcode.com/problems/toggle-light-bulbs/',
  complexity: 'O(n + 100) time and O(100) space. The visualization caps bulbs at 20 entries.',
  examples: [
    { label: 'Example', input: '{"bulbs":[10,30,20,10,20,40]}' },
    { label: 'Repeats cancel', input: '{"bulbs":[5,5]}' },
    { label: 'One bulb', input: '{"bulbs":[1]}' },
    { label: 'Equal values', input: '{"bulbs":[7,7,7,7]}' },
    { label: 'Largest values alternate', input: '{"bulbs":[100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1]}' },
    { label: 'Long run: 20 bulbs', input: '{"bulbs":[83,27,43,80,77,71,97,48,53,71,15,4,83,89,69,84,3,68,37,80]}' },
  ],
}

export default function ToggleLightBulbs() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <BulbBoard run={run} step={step} />} renderReasoning={() => <>
    <p>Each entry flips exactly one bulb. A bulb that is flipped an even number of times ends off, and an odd number of times ends on.</p>
    <p>Keeping one boolean per bulb makes each flip a constant-time update.</p>
  </>} />
}
