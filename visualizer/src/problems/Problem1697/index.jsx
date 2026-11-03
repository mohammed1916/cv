import withProblemStory from '../../components/shared/withProblemStory';
import storyGuide from './storyGuide.json';
import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace';
import { buildTrace, parseInput, code, python, phases, pythonLineMap } from './algorithm';

const definition = {
  parse: parseInput, build: buildTrace, code, python, pythonLineMap, phases,
  inputLabel: 'Graph and queries as a JSON object with nodes, edges and queries',
  url: 'https://leetcode.com/problems/checking-existence-of-edge-length-limited-paths/',
  complexity: 'O((E + Q) log(E + Q) + E * alpha(N)) time: sorting plus near-constant union-find operations.',
  examples: [
    { label: 'Limit separates a pair', input: '{"nodes": 4, "edges": [[0, 1, 2], [1, 2, 6], [2, 3, 3]], "queries": [[0, 2, 3], [0, 2, 7], [0, 3, 4]]}' },
    { label: 'Equal length excluded', input: '{"nodes": 3, "edges": [[0, 1, 4], [1, 2, 4]], "queries": [[0, 2, 4], [0, 2, 5]]}' },
    { label: 'Isolated node', input: '{"nodes": 3, "edges": [[0, 1, 1]], "queries": [[0, 1, 2], [1, 2, 9]]}' },
  ],
}

function LimitedGroups() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { labels, answers, edge, query, next, limit, p, q, result } = step.snapshot
    const edges = run.input.edges
    const groupsOf = [...new Set(labels)]
    return <>
      <section aria-label="Node groups">
        <h3>Groups under the current limit</h3>
        <ol>{groupsOf.map(root => <li key={root}>Group {root}: nodes {labels.map((label, node) => (label === root ? node : null)).filter(node => node !== null).join(', ')}</li>)}</ol>
        {limit !== undefined && <p>Current limit: {limit}. Edges used so far: {next} of {edges.length} in sorted order.</p>}
      </section>
      {edge !== null && edge !== undefined && <p>Joining edge {edges[edge].join(' - ')} (length {edges[edge][2]}).</p>}
      {query !== null && query !== undefined && p !== undefined && <p>Checking nodes {p} and {q}.</p>}
      <table>
        <caption>Answers by original query position</caption>
        <thead><tr><th>Query</th><th>Answer</th></tr></thead>
        <tbody>{answers.map((answer, index) => <tr key={index}><th>{index}</th><td>{answer === null ? 'pending' : String(answer)}</td></tr>)}</tbody>
      </table>
      {step.phase === 'done' && <output aria-label="Query answers">Answers: {result.map(String).join(', ')}</output>}
    </>
  }} renderReasoning={() => <>
    <p>Raising the limit only adds edges. Sorting queries by limit and edges by length lets one pointer add every edge that qualifies, and union-find tells which nodes already share a group.</p>
    <p>An edge is used only when its length is strictly below the limit, so an edge equal to the limit does not count.</p>
  </>} />
}

export default withProblemStory(LimitedGroups, storyGuide);
