import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Sort', description: 'Order the points and the queries by their first value.' },
    { id: 'insert', label: 'Insert', description: 'Add a point to the frontier, or skip it when dominated.' },
    { id: 'query', label: 'Query', description: 'Find the first frontier point that meets y.' },
    { id: 'done', label: 'Result', description: 'Report the answers in input order.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums1, nums2 (equal length) and queries ([x, y] pairs)',
  url: 'https://leetcode.com/problems/maximum-sum-queries/',
  complexity: 'O((n + q) log(n + q)) time with a monotonic frontier and binary search in the full version. This visualization uses a linear frontier scan and caps n at 8 and q at 6.',
  examples: [
    { label: 'Example 1', input: '{"nums1":[4,3,1,2],"nums2":[2,4,9,5],"queries":[[4,1],[1,3],[2,5]]}' },
    { label: 'Example 2', input: '{"nums1":[3,2,1],"nums2":[2,3,4],"queries":[[4,4],[3,2],[1,1]]}' },
  ],
}

export default function MaximumSumQueries() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums1 + nums2" length={run.input.nums1.length} valueAt={i => run.input.nums1[i] + run.input.nums2[i]} active={step.point ? run.input.nums1.findIndex((a, i) => a === step.point.a && run.input.nums2[i] === step.point.b) : -1} />
    <output aria-label="Frontier">{`frontier (y, sum) = [${step.frontier.map(f => `(${f.y}, ${f.s})`).join(', ')}]; answers = [${step.answer.join(', ')}]`}</output>
  </>} renderReasoning={() => <>
    <p>Process the queries from the largest x down. Each point with nums1 at least x is added once, and only the points that no other point beats in both coordinates stay in the frontier.</p>
    <p>The frontier is sorted by y with decreasing sums, so the first point whose y reaches the query's y gives the best sum for that query.</p>
  </>} />
}
