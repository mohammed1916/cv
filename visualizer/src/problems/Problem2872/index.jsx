import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import RootedTreeDiagram from '../../components/shared/RootedTreeDiagram'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Root', description: 'Root the tree at node 0 and process children before parents.' },
    { id: 'climb', label: 'Pass up', description: 'A subtree that is not divisible by k passes its total to its parent.' },
    { id: 'cut', label: 'Cut', description: 'A subtree divisible by k becomes a component; its edge above is cut.' },
    { id: 'done', label: 'Complete', description: 'Report the number of components.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Tree with n nodes, edges, node values, and k (JSON object)',
  url: 'https://leetcode.com/problems/maximum-number-of-k-divisible-components/',
  complexity: 'O(n) time and O(n) space. The visualization caps the tree at 12 nodes.',
  examples: [
    { label: 'Path', input: '{"n":3,"edges":[[0,1],[1,2]],"values":[1,2,3],"k":3}' },
    { label: 'Star', input: '{"n":4,"edges":[[0,1],[0,2],[0,3]],"values":[3,3,3,3],"k":3}' },
  ],
}

export default function MaximumKDivisibleComponents() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    step.cuts.forEach(id => { roles[id] = 'best' })
    if (step.current !== null) roles[step.current] = 'focus'
    return <>
      <RootedTreeDiagram title="Tree, rooted at node 0" root={run.tree} roles={roles} />
      <IndexedSequence label="Subtree total per node" length={step.total.length}
        valueAt={index => step.total[index]} active={step.current ?? -1}
        roleAt={index => (step.cuts.includes(index) ? 'cut' : '')} />
      <output aria-label="Components">{`Components so far: ${step.count}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Each component must sum to a multiple of k. Processing children first lets every subtree decide locally whether its total can be cut away.</p>
    <p>A subtree whose total is divisible by k is cut off, so it contributes nothing to its parent; otherwise its total is carried upward.</p>
  </>} />
}
