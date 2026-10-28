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
