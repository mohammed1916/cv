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
    { label: 'Single node', input: '{"vals":[7],"par":[-1]}' },
    { label: 'Equal values in a pair', input: '{"vals":[12,12],"par":[-1,0]}' },
    { label: 'Every value repeats a digit', input: '{"vals":[11,22,333],"par":[-1,0,1]}' },
    { label: 'Long run: 8 nodes', input: '{"vals":[617,798,101,93,935,921,950,171],"par":[-1,0,1,0,0,2,2,6]}' },
    { label: 'Largest values allowed', input: '{"vals":[999,987,654,321],"par":[-1,0,1,2]}' },
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
