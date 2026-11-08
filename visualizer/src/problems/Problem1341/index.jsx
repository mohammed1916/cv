import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with movies, users and ratings (small sample tables)',
  url: 'https://leetcode.com/problems/movie-rating/',
  complexity: 'Each table is scanned a constant number of times; grouping costs O(r) for r ratings.',
  examples: [
    { label: 'Tie on count', input: '{"movies":[{"movie_id":1,"title":"Alpha"},{"movie_id":2,"title":"Beta"},{"movie_id":3,"title":"Gamma"}],"users":[{"user_id":1,"name":"Ann"},{"user_id":2,"name":"Bob"},{"user_id":3,"name":"Cy"}],"ratings":[{"movie_id":1,"user_id":1,"rating":4,"created_at":"2020-02-05"},{"movie_id":2,"user_id":1,"rating":3,"created_at":"2020-02-10"},{"movie_id":3,"user_id":1,"rating":5,"created_at":"2020-03-01"},{"movie_id":1,"user_id":2,"rating":2,"created_at":"2020-02-20"},{"movie_id":2,"user_id":2,"rating":4,"created_at":"2020-02-22"},{"movie_id":1,"user_id":3,"rating":5,"created_at":"2020-02-01"},{"movie_id":2,"user_id":3,"rating":5,"created_at":"2020-01-15"},{"movie_id":3,"user_id":3,"rating":1,"created_at":"2020-02-18"}]}' },
    { label: 'No February rating', input: '{"movies":[{"movie_id":1,"title":"Solo"}],"users":[{"user_id":1,"name":"Eve"}],"ratings":[{"movie_id":1,"user_id":1,"rating":4,"created_at":"2020-03-02"}]}' },
    { label: "Single rating", input: "{\"movies\":[{\"movie_id\":1,\"title\":\"Solo\"}],\"users\":[{\"user_id\":1,\"name\":\"Eve\"}],\"ratings\":[{\"movie_id\":1,\"user_id\":1,\"rating\":4,\"created_at\":\"2020-02-01\"}]}" },
    { label: "Tied counts", input: "{\"movies\":[{\"movie_id\":1,\"title\":\"Alpha\"},{\"movie_id\":2,\"title\":\"Beta\"}],\"users\":[{\"user_id\":1,\"name\":\"Ann\"}],\"ratings\":[{\"movie_id\":1,\"user_id\":1,\"rating\":3,\"created_at\":\"2020-02-03\"},{\"movie_id\":2,\"user_id\":1,\"rating\":5,\"created_at\":\"2020-02-04\"}]}" },
    { label: "Long run: eight movies, twenty ratings", input: "{\"movies\":[{\"movie_id\":1,\"title\":\"Film 1\"},{\"movie_id\":2,\"title\":\"Film 2\"},{\"movie_id\":3,\"title\":\"Film 3\"},{\"movie_id\":4,\"title\":\"Film 4\"},{\"movie_id\":5,\"title\":\"Film 5\"},{\"movie_id\":6,\"title\":\"Film 6\"},{\"movie_id\":7,\"title\":\"Film 7\"},{\"movie_id\":8,\"title\":\"Film 8\"}],\"users\":[{\"user_id\":1,\"name\":\"User 1\"},{\"user_id\":2,\"name\":\"User 2\"},{\"user_id\":3,\"name\":\"User 3\"},{\"user_id\":4,\"name\":\"User 4\"},{\"user_id\":5,\"name\":\"User 5\"},{\"user_id\":6,\"name\":\"User 6\"},{\"user_id\":7,\"name\":\"User 7\"},{\"user_id\":8,\"name\":\"User 8\"}],\"ratings\":[{\"movie_id\":8,\"user_id\":8,\"rating\":5,\"created_at\":\"2020-02-11\"},{\"movie_id\":7,\"user_id\":2,\"rating\":3,\"created_at\":\"2020-02-19\"},{\"movie_id\":1,\"user_id\":5,\"rating\":3,\"created_at\":\"2020-01-27\"},{\"movie_id\":5,\"user_id\":6,\"rating\":5,\"created_at\":\"2020-01-17\"},{\"movie_id\":5,\"user_id\":4,\"rating\":3,\"created_at\":\"2020-02-26\"},{\"movie_id\":6,\"user_id\":8,\"rating\":1,\"created_at\":\"2020-02-25\"},{\"movie_id\":6,\"user_id\":3,\"rating\":4,\"created_at\":\"2020-01-06\"},{\"movie_id\":6,\"user_id\":4,\"rating\":1,\"created_at\":\"2020-01-21\"},{\"movie_id\":8,\"user_id\":3,\"rating\":2,\"created_at\":\"2020-02-06\"},{\"movie_id\":5,\"user_id\":4,\"rating\":2,\"created_at\":\"2020-02-18\"},{\"movie_id\":4,\"user_id\":3,\"rating\":4,\"created_at\":\"2020-01-06\"},{\"movie_id\":6,\"user_id\":1,\"rating\":3,\"created_at\":\"2020-01-05\"},{\"movie_id\":6,\"user_id\":1,\"rating\":4,\"created_at\":\"2020-02-20\"},{\"movie_id\":3,\"user_id\":2,\"rating\":3,\"created_at\":\"2020-02-03\"},{\"movie_id\":7,\"user_id\":2,\"rating\":4,\"created_at\":\"2020-02-10\"},{\"movie_id\":7,\"user_id\":3,\"rating\":5,\"created_at\":\"2020-02-08\"},{\"movie_id\":4,\"user_id\":1,\"rating\":5,\"created_at\":\"2020-02-05\"},{\"movie_id\":7,\"user_id\":8,\"rating\":1,\"created_at\":\"2020-02-25\"},{\"movie_id\":5,\"user_id\":5,\"rating\":3,\"created_at\":\"2020-01-02\"},{\"movie_id\":6,\"user_id\":1,\"rating\":5,\"created_at\":\"2020-01-20\"}]}" },
  ],
}

function RowTable({ label, rows }) {
  if (!rows.length) return <p>No rows yet.</p>
  const columns = Object.keys(rows[0])
  return <table aria-label={label}>
    <thead><tr>{columns.map(c => <th key={c}>{c}</th>)}</tr></thead>
    <tbody>{rows.map((row, i) => <tr key={i}>{columns.map(c => <td key={c}>{String(row[c])}</td>)}</tr>)}</tbody>
  </table>
}

export default function MovieRating() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <RowTable label="Current rows" rows={step.rows} />
    {step.phase === 'output' && <p>Result rows: {step.rows.map(r => r.results).join(', ') || 'none'}</p>}
  </>} renderReasoning={() => <>
    <p>The user part counts ratings per user and sorts by count, then by name.</p>
    <p>The movie part keeps February 2020 ratings, averages them per movie, then sorts by average, then by title.</p>
  </>} />
}
