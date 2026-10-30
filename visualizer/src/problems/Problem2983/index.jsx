import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'setup', label: 'Setup', description: "Split s into A and reversed B." },
    { id: 'query', label: 'Query', description: "Map the query to A and B ranges." },
    { id: 'fixed', label: 'Fixed', description: "Check fixed mirror positions." },
    { id: 'counts', label: 'Counts', description: "Compare free letter counts." },
    { id: 'answer', label: 'Answer', description: "Record the boolean." },
    { id: 'done', label: 'Result', description: "Return all answers." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "JSON object: {\"s\": \"...\", \"queries\": [[a,b,c,d],...]}",
  url: "https://leetcode.com/problems/palindrome-rearrangement-queries/",
  complexity: "This view checks each query in O(n + 26) with plain counting, so O(n * q) time overall. The visualization caps s at 50 characters and 20 queries.",
  examples: [
    { label: "abcabc", input: "{\"s\": \"abcabc\", \"queries\": [[1, 1, 3, 5], [0, 2, 5, 5]]}" },
    { label: "abbcdecbba", input: "{\"s\": \"abbcdecbba\", \"queries\": [[0, 2, 7, 9]]}" },
    { label: "acbcab", input: "{\"s\": \"acbcab\", \"queries\": [[1, 2, 4, 5]]}" },
  ],
}

export default function Problem2983() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <>
      <IndexedSequence label={"Mirror pairs A[i] | B[i]"} length={step.seq.length} valueAt={i => step.seq[i]} active={step.index} />
      <dl className="algorithm-workspace__stats">
        {Object.entries(step.stats || {}).map(([name, value]) => <div key={name}><dt>{name}</dt><dd>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</dd></div>)}
      </dl>
      <p role="status">{step.message}</p>
      <p>Result: <output>{JSON.stringify(run.result)}</output></p>
    </>}
    renderReasoning={({ step }) => <>
      <p>{"Rearranging inside a range is any permutation. Positions outside both ranges must already mirror. Letters that can move between the ranges must match after removing fixed letters."}</p>
      <p>{step.message}</p>
    </>}
  />
}
