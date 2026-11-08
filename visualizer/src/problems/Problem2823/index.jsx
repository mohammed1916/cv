import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import DeepFilterView from './DeepFilterView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '2823',
  phases: [
    { id: 'start', label: 'Start', description: 'Call the walk on the root.' },
    { id: 'enter', label: 'Open', description: 'Enter an array or object.' },
    { id: 'test', label: 'Test', description: 'Run fn on a plain value.' },
    { id: 'keep', label: 'Keep', description: 'The parent stores a surviving child.' },
    { id: 'drop', label: 'Drop', description: 'The parent leaves out a child that returned nothing.' },
    { id: 'close', label: 'Close', description: 'An empty container returns nothing too.' },
    { id: 'done', label: 'Result', description: 'Report the filtered value or undefined.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with obj and fn (positive, negative, even, odd, string, number, boolean, null, truthy, isArray)',
  url: 'https://leetcode.com/problems/deep-object-filter/',
  complexity: 'O(v) time and O(d) extra stack for v values and depth d, plus the copied output. The official input can reach 100000 characters; this page caps it at 60 values and containers and offers named predicates in place of a typed function.',
  examples: [
    { label: 'Removal cascades', input: '{"obj":{"id":7,"tags":["new","old",3],"meta":{"size":-2,"owner":{"age":-1}}},"fn":"positive"}' },
    { label: 'Array positions close up', input: '{"obj":[1,[4,-4,[8]],"x",[3],{"a":6,"b":5}],"fn":"even"}' },
    { label: 'Nothing survives', input: '{"obj":[[],{"x":[null]},"hi"],"fn":"number"}' },
    { label: "Single kept value", input: "{\"obj\":[5],\"fn\":\"positive\"}" },
    { label: "Zero is not positive", input: "{\"obj\":[0,0],\"fn\":\"positive\"}" },
    { label: "Single removed value", input: "{\"obj\":[-5],\"fn\":\"positive\"}" },
    { label: "Long run: 10 seeded objects", input: "{\"obj\":[{\"v\":20,\"w\":[0,-5]},{\"v\":-15,\"w\":[0,5]},{\"v\":4,\"w\":[2,-8]},{\"v\":0,\"w\":[-2,1]},{\"v\":-16,\"w\":[8,7]},{\"v\":-12,\"w\":[-2,-9]},{\"v\":-3,\"w\":[9,-1]},{\"v\":1,\"w\":[4,-6]},{\"v\":-1,\"w\":[2,4]},{\"v\":3,\"w\":[-8,8]}],\"fn\":\"even\"}" },
  ],
}

export default function DeepObjectFilter() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <DeepFilterView run={run} step={step} />} renderReasoning={() => <>
    <p>Only plain values face the predicate. A container is judged afterwards, by whether any child survived, so the recursion has to finish the children first.</p>
    <p>That order lets removal cascade upward: a value disappears, its array empties, and the array then disappears from its own parent.</p>
    <p>Returning a distinct "nothing" keeps a legitimate null value separate from a removed one.</p>
  </>} />
}
