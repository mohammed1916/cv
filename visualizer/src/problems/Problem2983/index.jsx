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
    { label: "Already a palindrome", input: "{\"s\": \"abccba\", \"queries\": [[0, 0, 5, 5], [1, 1, 4, 4]]}" },
    { label: "One letter moves", input: "{\"s\": \"abcabc\", \"queries\": [[0, 0, 3, 5]]}" },
    { label: "acbcab", input: "{\"s\": \"acbcab\", \"queries\": [[1, 2, 4, 5]]}" },
    { label: "Two letters", input: '{"s":"ab","queries":[[0,0,1,1]]}' },
    { label: "Equal letters", input: '{"s":"aaaa","queries":[[0,1,2,3]]}' },
    { label: "Full halves", input: '{"s":"abcdefghij","queries":[[0,4,5,9]]}' },
    { label: "Long run: 50 letters, 20 queries", input: '{"s":"dedaddbcdcbbdcaaabecdebaedeedeecddeebededacdccceab","queries":[[9,12,47,49],[2,18,40,40],[13,15,45,45],[23,23,46,46],[21,21,35,43],[8,24,42,49],[0,19,40,45],[18,22,39,46],[11,12,37,39],[18,23,35,43],[17,17,32,37],[18,23,39,47],[7,18,49,49],[1,5,28,36],[23,24,26,27],[8,23,42,47],[0,5,25,42],[5,6,33,42],[0,12,29,49],[22,23,47,47]]}' },
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
