import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'
import CuisineHeapsView from './CuisineHeapsView'

const definition = {
  phases: [
    { id: 'start', label: 'Foods', description: 'Each cuisine gets a heap of its foods keyed by rating.' },
    { id: 'change', label: 'Change', description: 'Set the new rating and push a fresh entry; the old one becomes stale.' },
    { id: 'query', label: 'Query', description: 'Skip stale entries and answer with the top food.' },
    { id: 'done', label: 'Complete', description: 'Every operation has been answered.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"foods", "cuisines", "ratings", "operations", "arguments"}',
  url: 'https://leetcode.com/problems/design-a-food-rating-system/',
  complexity: 'O(log n) per changeRating and amortised O(log n) per highestRated with lazy heaps. The visualization caps input at 8 foods and 12 operations.',
  examples: [
    { label: 'Example', input: '{"foods":["pho","bun","taco","burrito"],"cuisines":["viet","viet","mex","mex"],"ratings":[7,9,4,4],"operations":["highestRated","changeRating","highestRated","highestRated","changeRating","highestRated"],"arguments":[["viet"],["bun",3],["viet"],["mex"],["taco",6],["mex"]]}' },
  ],
}

export default function FoodRatingSystem() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <CuisineHeapsView heaps={step.heaps} top={step.top} cuisine={step.cuisine} />
    <table aria-label="Current ratings">
      <thead><tr><th scope="col">Food</th><th scope="col">Rating</th></tr></thead>
      <tbody>{Object.entries(step.rating).map(([food, r]) => <tr key={food}><th scope="row">{food}</th><td>{r}</td></tr>)}</tbody>
    </table>
    <output aria-label="Answer">{step.answer === null ? 'No query answered in this step.' : `Answer: ${step.answer}`}</output>
    <p>{step.message}</p>
  </>} renderReasoning={() => <>
    <p>Changing a rating does not remove the old heap entry; the entry is skipped later when its rating no longer matches the food.</p>
    <p>Ties on rating go to the lexicographically smaller name, which the heap order gives directly.</p>
  </>} />
}
