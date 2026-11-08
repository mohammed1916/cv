import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'
import JsonView from './JsonView'

const definition = {
  number: '2633',
  phases: [
    { id: 'array', label: 'Array', description: 'Write items inside brackets.' },
    { id: 'object', label: 'Object', description: 'Write key and value pairs inside braces.' },
    { id: 'string', label: 'String', description: 'Wrap the text in quotes.' },
    { id: 'leaf', label: 'Leaf', description: 'Write a number, boolean or null.' },
    { id: 'done', label: 'Result', description: 'The joined text.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with a value field (nested arrays and objects allowed, at most 3 levels)',
  url: 'https://leetcode.com/problems/convert-object-to-json-string/',
  complexity: 'O(size of the value) time and O(size) space for the output pieces.',
  examples: [
    { label: 'Nested', input: '{"value":{"a":[1,true,null],"b":"hi there"}}' },
    { label: 'Array', input: '{"value":[3,"ab"]}' },
    { label: 'Single null', input: '{"value":null}' },
    { label: 'Equal strings in an array', input: '{"value":["ab","ab"]}' },
    { label: 'Limit depth and item counts', input: '{"value":{"a":[1,2,3,4,5],"b":{"c":[true,false,null],"d":"x y"},"e":1,"f":"z","g":[[1]]}}' },
    { label: 'Long run: nested object', input: '{"value":{"alpha":[1,-2,3,4,5],"beta":{"gamma":[true,null,"deep one"]},"delta":"x y z"}}' },
  ],
}

export default function ConvertObjectToJsonString() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <JsonView view={step.view} />}
    renderReasoning={() => <>
      <p>Serialising is a recursion: arrays and objects are opened, their children are written in order, and then they are closed.</p>
      <p>Leaves (numbers, booleans, null and strings) are written directly. Commas go between siblings only.</p>
    </>} />
}
