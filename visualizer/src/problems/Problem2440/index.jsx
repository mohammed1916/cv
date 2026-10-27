import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import GraphTraversalView from '../../components/shared/GraphTraversalView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Total', description: 'Compute the total value of the tree.' },
    { id: 'skip', label: 'Skip count', description: 'This many parts cannot have equal sums.' },
    { id: 'try', label: 'Try split', description: 'Set the target sum for each part.' },
    { id: 'cut', label: 'Cut part', description: 'A subtree sums exactly to the target, so cut above it.' },
    { id: 'fail', label: 'Split fails', description: 'A subtree exceeds the target.' },
    { id: 'found', label: 'Answer', description: 'A split works; report the deletable edges.' },
    { id: 'done', label: 'Complete', description: 'No split works.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Tree as JSON: nums, edges',
  url: 'https://leetcode.com/problems/create-components-with-same-value/',
  complexity: 'O(n * d(S)) time for the splits tried, where S is the total value. The visualization caps input at 10 vertices.',
  examples: [
    { label: 'Example 1', input: '{"nums":[6,2,2,2,6],"edges":[[0,1],[1,2],[1,3],[3,4]]}' },
    { label: 'Two parts', input: '{"nums":[3,3,3],"edges":[[0,1],[1,2]]}' },
  ],
}

export default function CreateComponentsWithSameValue() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const tags = {}
    run.input.nums.forEach((value, id) => { tags[id] = `${step.left[id]} of ${value}` })
    return <>
      <GraphTraversalView title="Tree (remaining sum per vertex)" n={run.input.nums.length} edges={run.input.edges}
        current={step.node} done={step.cutNodes} tags={tags} />
      <output aria-label="Split status">
        {step.k === null ? 'No split chosen yet' : step.target === null ? `k = ${step.k}: skipped` : `k = ${step.k}, target ${step.target}, cuts ${step.cuts}`}
      </output>
    </>
  }} renderReasoning={() => <>
    <p>If the tree splits into k components of equal sum, the total must be k times that sum, so only divisors of the total are candidates.</p>
    <p>Each candidate is checked bottom-up: a subtree whose remaining sum equals the target is cut, and one above the target rejects the split.</p>
  </>} />
}
