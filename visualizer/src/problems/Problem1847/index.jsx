import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Sort rooms by size and queries by minimum size.' },
    { id: 'add', label: 'Add room', description: 'Make a room usable once it is big enough for the current query.' },
    { id: 'query', label: 'Query', description: 'Find the closest usable id to the preferred id.' },
    { id: 'done', label: 'Complete', description: 'Return the answers in the original order.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object: {"rooms": [[id, size], ...], "queries": [[preferred, minSize], ...]}',
  url: 'https://leetcode.com/problems/closest-room/',
  complexity: 'Sorting dominates, then each room insert and query is a binary search over the usable ids. The visualization caps input at 6 rooms and 6 queries.',
  examples: [
    { label: 'Own case 1', input: '{"rooms":[[3,3],[2,3],[4,3]],"queries":[[4,2],[4,4],[6,3]]}' },
    { label: 'Example 2', input: '{"rooms":[[4,1],[6,1]],"queries":[[5,1],[5,2]]}' },
  { label: 'Single room', input: "{\"rooms\":[[1,5]],\"queries\":[[1,5]]}" },
  { label: 'Equal room sizes', input: "{\"rooms\":[[2,4],[5,4]],\"queries\":[[3,4]]}" },
  { label: 'Largest values', input: "{\"rooms\":[[1,10],[2,10],[3,10],[4,10],[5,10],[6,10]],\"queries\":[[10,10],[10,10],[10,10],[10,10],[10,10],[10,10]]}" },
  { label: 'Long run: 6 rooms, 6 queries', input: "{\"rooms\":[[1,7],[2,6],[3,7],[4,3],[5,1],[6,5]],\"queries\":[[2,6],[5,6],[5,4],[5,5],[9,9],[8,7]]}" },
  ],
}

export default function ClosestRoom() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Usable room ids (sorted)" length={step.ids.length} valueAt={i => step.ids[i]} />
    <output aria-label="Answer">{`Query ${step.query ?? '-'}; answer ${step.answer ?? '-'}; rooms by size ${run.roomsBySize.map(r => r[0]).join(', ')}`}</output>
  </>} renderReasoning={() => <>
    <p>Sorting queries from the largest minimum size down means each room only needs to be added once and stays usable for every later query.</p>
    <p>The closest id is either the nearest id just below the preference or the nearest just above it, and a tie keeps the smaller id.</p>
  </>} />
}
