import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RootedTreeDiagram from '../../components/shared/RootedTreeDiagram'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No palindrome-able pairs counted yet.' },
    { id: 'pair', label: 'Pair', description: 'Read the letters on the path between u and v.' },
    { id: 'done', label: 'Result', description: 'Report the count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with parent (parent[0] = -1, parents come earlier) and s (letters a to e)',
  url: 'https://leetcode.com/problems/count-paths-that-can-form-a-palindrome-in-a-tree/',
  complexity: 'O(n^3) time in this pair-by-pair version. The visualization caps the tree at 10 nodes.',
  examples: [
    { label: 'Example', input: '{"parent":[-1,0,0],"s":"aba"}' },
    { label: 'Two nodes', input: '{"parent":[-1,0],"s":"ab"}' },
  ],
}

export default function CountPalindromePaths() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    step.path.forEach(x => { roles[x] = 'target' })
    if (step.u >= 0) roles[step.u] = 'focus'
    if (step.v >= 0) roles[step.v] = 'new'
    return <>
      <RootedTreeDiagram root={run.root} roles={roles} title="Tree (node ids)" />
      <output aria-label="Path letters">{step.u < 0 ? `Pairs counted: ${step.count}` : `Path ${step.u} to ${step.v} reads "${step.text}": ${step.ok ? 'palindrome-able' : 'not'}. Count ${step.count}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>A string can be rearranged into a palindrome exactly when at most one letter occurs an odd number of times.</p>
    <p>Each pair is checked by collecting the letters along its path, which includes both ends.</p>
  </>} />
}
