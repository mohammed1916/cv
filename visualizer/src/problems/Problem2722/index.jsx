import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import HashMapView from '../../components/shared/HashMapView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty table', description: 'No object is stored yet.' },
    { id: 'first', label: 'arr1 objects', description: 'Store each arr1 object under its id.' },
    { id: 'merge', label: 'arr2 objects', description: 'Merge into an existing id, or add a new entry.' },
    { id: 'done', label: 'Joined', description: 'Return the objects sorted by id.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Two object arrays as JSON: {"arr1": [...], "arr2": [...]}',
  url: 'https://leetcode.com/problems/join-two-arrays-by-id/',
  complexity: 'O((n + m) log(n + m)) time for the final sort, with O(n + m) space. The visualization caps each array at 8 objects.',
  examples: [
    { label: 'Example 1', input: '{"arr1":[{"id":1,"x":2,"y":3},{"id":2,"x":3,"y":6}],"arr2":[{"id":2,"x":10,"y":4},{"id":3,"x":2,"y":9}]}' },
    { label: 'Single object each', input: '{"arr1":[{"id":1,"x":5}],"arr2":[{"id":1,"x":5}]}' },
    { label: 'Equal values', input: '{"arr1":[{"id":4,"x":2,"y":2}],"arr2":[{"id":4,"x":2,"y":2}]}' },
    { label: 'Largest values', input: '{"arr1":[{"id":50,"x":99,"y":99}],"arr2":[{"id":49,"x":0,"y":0},{"id":50,"x":99,"y":0}]}' },
    { label: 'Long run: 8 objects each', input: '{"arr1":[{"id":1,"x":31,"y":69},{"id":2,"x":28,"y":14},{"id":3,"x":73,"y":11},{"id":4,"x":70,"y":56},{"id":5,"x":15,"y":53},{"id":6,"x":12,"y":98},{"id":7,"x":57,"y":95},{"id":8,"x":54,"y":40}],"arr2":[{"id":3,"x":79,"y":89},{"id":4,"x":76,"y":86},{"id":5,"x":21,"y":31},{"id":6,"x":18,"y":28},{"id":7,"x":63,"y":73},{"id":8,"x":60,"y":70},{"id":9,"x":5,"y":15},{"id":10,"x":2,"y":12}]}' },
  ],
}

export default function JoinById() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <HashMapView maps={step.maps} ops={step.ops} />
    <output aria-label="Joined so far">{step.result.length ? `Joined: ${JSON.stringify(step.result)}` : 'Joined result not ready yet'}</output>
  </>} renderReasoning={() => <>
    <p>Indexing by id turns each merge into one lookup. An arr2 object with an existing id overwrites the matching fields and keeps the rest.</p>
    <p>Ids that appear in only one array are kept as they are, and the output is sorted by id.</p>
  </>} />
}
