import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with every balance at zero.' },
    { id: 'take', label: 'Grant', description: 'Grant the request: move one out of its source, one into its target.' },
    { id: 'undo', label: 'Undo', description: 'Undo the grant before trying the other branch.' },
    { id: 'skip', label: 'Refuse', description: 'Refuse the request and continue.' },
    { id: 'check', label: 'Check', description: 'Keep the count only when every building is balanced.' },
    { id: 'done', label: 'Complete', description: 'Report the best count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n (buildings) and requests ([from, to] pairs, JSON)',
  url: 'https://leetcode.com/problems/maximum-number-of-achievable-transfer-requests/',
  complexity: 'O(2^m * (m + n)) time for m requests. The visualization caps m at 8.',
  examples: [
    { label: 'Four transfers', input: '{"n":5,"requests":[[0,3],[3,1],[4,2],[2,0]]}' },
    { label: 'Example 3', input: '{"n":4,"requests":[[0,3],[3,1],[1,0],[2,1]]}' },
    { label: "Single building", input: "{\"n\":1,\"requests\":[[0,0]]}" },
    { label: "Same pair twice", input: "{\"n\":2,\"requests\":[[0,1],[0,1]]}" },
    { label: "Six buildings, eight requests", input: "{\"n\":6,\"requests\":[[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[0,3],[2,5]]}" },
    { label: "Long run: 6 buildings, 8 requests", input: "{\"n\":6,\"requests\":[[1,5],[3,5],[1,4],[5,2],[2,2],[4,4],[5,2],[2,4]]}" },
  ],
}

export default function TransferRequests() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Net balance per building (in minus out)" length={run.input.n} valueAt={i => step.balance[i]}
      active={-1} roleAt={i => (step.balance[i] === 0 ? 'balanced' : '')} />
    <output aria-label="Search state">{`Request ${step.at === run.input.requests.length ? 'end' : step.at}, granted so far ${step.taken}, best ${step.best}`}</output>
  </>} renderReasoning={() => <>
    <p>Each granted request moves one unit out of its source and into its target. A set of requests is achievable when every building ends with zero net change.</p>
    <p>The search decides for each request whether to grant it, tries both choices, and keeps the largest achievable count.</p>
  </>} />
}
