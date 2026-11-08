import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RootedTreeDiagram from '../../components/shared/RootedTreeDiagram'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '2236',
  phases: [
    { id: 'setup', label: 'Tree', description: 'Read the root and its two children.' },
    { id: 'compare', label: 'Compare', description: 'Compare the root with the sum of the children.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"root": 9, "left": 2, "right": 7}',
  url: 'https://leetcode.com/problems/root-equals-sum-of-children/',
  complexity: 'O(1) time and O(1) space for the three-node tree.',
  examples: [
    { label: 'Equal', input: '{"root":9,"left":2,"right":7}' },
    { label: 'Not equal', input: '{"root":4,"left":1,"right":2}' },
    { label: 'All zeros', input: '{"root":0,"left":0,"right":0}' },
    { label: 'Equal children', input: '{"root":-100,"left":-100,"right":100}' },
    { label: 'Long run: repeated values', input: '{"root":57,"left":-23,"right":57}' },
  ],
}

export default function RootSumOfChildren() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <RootedTreeDiagram title="Three-node tree" root={step.tree} roles={step.roles} />
    <ul aria-label="Node values">
      <li>{`root ${run.input.root}`}</li>
      <li>{`left ${run.input.left}`}</li>
      <li>{`right ${run.input.right}`}</li>
    </ul>
    <output aria-label="Sum check">{step.sum === null ? 'children not added yet' : `${run.input.left} + ${run.input.right} = ${step.sum}`}</output>
    <p role="status">{step.message}</p>
  </>} renderReasoning={() => <>
    <p>The check needs only the three values. Add the two children and compare the sum with the root.</p>
  </>} />
}
