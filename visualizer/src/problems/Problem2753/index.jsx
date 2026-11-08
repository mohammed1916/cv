import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import StreetRingView from './StreetRingView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2753',
  phases,
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with street (1 open, 0 closed, walker starts at the first entry) and k',
  url: 'https://leetcode.com/problems/count-houses-in-a-circular-street-ii/',
  complexity: 'O(k) time and O(1) extra space, since the walker makes at most n + k moves and n is at most k. The official limit on n and k is 100000; the visualization caps street at 24 houses and k at 60.',
  examples: [
    { label: 'Loose bound', input: '{"street":[0,1,0,0,1,1],"k":9}' },
    { label: 'One open door, tight bound', input: '{"street":[0,0,1,0],"k":4}' },
    { label: 'Single house', input: '{"street":[1],"k":4}' },
    { label: 'Open door at the far end, maximum k', input: '{"street":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],"k":60}' },
    { label: 'Every door open: equal values', input: '{"street":[1,1,1,1],"k":4}' },
    { label: 'Minimum k equals house count', input: '{"street":[1,0,1],"k":3}' },
    { label: 'Long run: 24 houses, k 57', input: '{"street":[1,0,0,1,0,1,1,0,0,1,1,0,0,0,0,0,1,1,0,1,0,0,1,0],"k":57}' },
  ],
}

export default function CountHousesInACircularStreetII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <StreetRingView run={run} step={step} />} renderReasoning={() => <>
    <p>Doors can only be shut, never opened, so the only marker the walker can rely on is a door that is already open. It stops at one and deliberately leaves it open.</p>
    <p>Every other door that is open gets shut when the walker passes it, all before it comes round again. So the anchor is the last door on the ring still open, and it is reached after exactly n steps. Shutting it leaves nothing open, so steps beyond the first lap cannot change the answer.</p>
    <p>That is why k steps are always enough, and why the last step that found an open door equals the number of houses.</p>
  </>} />
}
