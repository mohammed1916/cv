import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Order the nodes so children come before parents.' },
    { id: 'node', label: 'Node', description: 'Merge the children and add this node value when its digits are distinct.' },
    { id: 'done', label: 'Complete', description: 'Sum the best score of every subtree.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with vals and par (JSON)',
  url: 'https://leetcode.com/problems/maximum-good-subtree-score/',
  complexity: 'O(n * 2^10 * merges) with digit masks. The visualization caps the tree at 8 nodes.',
  examples: [
    { label: 'Example 1', input: '{"vals":[2,3],"par":[-1,0]}' },
    { label: 'Example 3', input: '{"vals":[34,1,2],"par":[-1,0,1]}' },
  ],
}

export default function MaximumGoodSubtreeScore() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Node values" length={run.input.vals.length} valueAt={i => run.input.vals[i]} active={step.node ?? -1} />
    <output aria-label="Best">{step.node === null ? 'Sum not known yet' : `maxScore of node ${step.node}: ${step.best}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>A good subset uses each digit at most once, so each subtree is summarized by which digits it uses and the best score for that set.</p>
  </>} />
}
