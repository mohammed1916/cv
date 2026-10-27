import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

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
    { label: 'Example', input: '{"foods":["kimchi","miso","sushi","moussaka","ramen","bulgogi"],"cuisines":["korean","japanese","japanese","greek","japanese","korean"],"ratings":[9,12,8,15,14,7],"operations":["highestRated","highestRated","changeRating","highestRated","changeRating","highestRated"],"arguments":[["korean"],["japanese"],["sushi",16],["japanese"],["ramen",16],["japanese"]]}' },
  ],
}

export default function FoodRatingSystem() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
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
