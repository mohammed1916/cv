import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Serialize subtrees bottom-up.' },
    { id: 'serialize', label: 'Serialize node', description: 'Build the key from the node value and both child keys.' },
    { id: 'done', label: 'Report', description: 'Return one root value for each duplicated shape.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Tree (LeetCode level-order JSON array)',
  url: 'https://leetcode.com/problems/find-duplicate-subtrees/',
  complexity: 'O(n) nodes, each serialized once; the key length can add up to O(n²) characters in the worst case.',
  examples: [
    { label: 'Leaf pairs', input: '[5,4,4,3,null,3]' },
    { label: 'Repeated leaves', input: '[1,1,1,null,1]' },
    { label: 'No repeats', input: '[8,3,null]' },
    { label: 'Single node', input: '[1]' },
    { label: 'All equal values', input: '[0,0,0,0,0,0,0]' },
    { label: 'Extreme values', input: '[-200,200,-200,null,null,200,null]' },
    { label: 'Long run: 1023 nodes', input: '[-2,0,-2,-1,-2,1,1,0,0,1,-1,-1,1,2,2,1,0,1,0,-1,1,1,0,1,2,2,-1,0,-1,1,0,-1,-2,1,2,2,-1,2,-1,-2,-1,2,2,2,-2,2,1,-2,1,1,1,-1,-2,1,-2,2,-2,1,0,2,-1,2,0,-1,-2,1,2,1,-2,-1,1,1,0,0,2,0,2,-2,0,2,2,-2,-2,1,1,0,-1,-2,-1,-1,2,1,1,-2,-2,-1,0,0,0,0,0,1,2,1,0,1,0,-1,2,0,1,-2,0,1,2,-2,2,-2,-2,-1,2,-1,0,2,0,2,-1,-2,0,-2,-2,-1,2,-1,1,1,2,2,2,2,2,-2,1,0,-1,1,-2,-2,-1,1,-1,-2,-1,1,0,2,2,0,-2,2,-2,1,2,2,0,0,-1,-1,1,-1,-2,-1,2,1,0,2,0,-2,2,-2,-2,0,0,-1,-2,1,-1,-1,0,-1,-2,1,1,-2,1,0,-1,-1,-1,2,-2,1,-2,2,0,-1,0,1,-2,0,-1,-2,-1,1,0,0,1,2,1,-1,-2,2,1,0,-1,2,2,-2,-2,-2,-1,-2,0,0,-1,1,-2,1,1,-1,-2,1,0,-2,1,0,-2,0,-2,-1,-1,-2,1,-1,-1,1,1,-2,-2,0,0,0,2,2,2,-1,-2,2,1,2,-1,-2,-2,2,-2,1,0,0,1,2,2,-1,0,2,1,-2,0,0,1,-2,1,1,-2,-1,2,-2,-1,-1,-1,-1,0,-1,1,1,1,-2,1,0,-2,2,-1,1,1,2,2,1,-2,1,-2,0,2,2,-1,0,1,-1,-1,1,0,-2,-2,1,-1,1,2,1,2,-2,-1,0,-2,2,-2,2,0,-1,1,-2,-1,-2,2,0,-1,0,1,0,1,-1,-1,-1,1,2,2,-1,1,-1,-1,2,0,1,-2,0,0,0,-2,1,2,-1,2,-1,1,-2,-2,-2,1,-2,-1,-1,0,-2,-2,-1,2,-1,-1,2,-2,0,-2,2,-1,2,-2,-2,0,-2,-1,-1,-1,-1,1,-2,2,0,-1,-1,-2,-1,1,-2,2,-1,-2,-1,-2,0,0,-2,2,-1,1,2,0,1,0,1,0,-1,0,1,1,2,1,2,-2,-1,-1,-2,0,-2,-2,-1,-1,1,-2,2,-1,0,-1,0,-1,1,-2,2,1,0,-2,0,0,0,0,2,-2,-2,2,1,-2,1,2,2,-2,0,1,0,2,1,-1,2,0,2,-2,-2,0,1,1,-2,1,2,2,-1,1,-2,-2,-1,-1,2,0,0,-2,-2,1,0,-2,1,2,1,-2,-2,1,2,-2,1,0,-1,2,-2,0,-2,2,2,-2,0,2,2,2,2,2,2,-1,1,-1,-2,2,1,1,-1,1,2,0,2,-2,0,-1,0,-2,2,1,1,1,2,1,0,-1,-2,-1,-2,-2,1,2,0,-1,2,-2,0,2,2,2,0,0,-2,-1,0,-1,2,-1,2,2,0,-2,1,-1,-1,2,0,-2,-1,-2,0,1,1,-1,2,2,-2,2,-1,-2,2,1,0,1,1,-2,0,1,-1,1,1,2,2,1,0,2,-1,2,-2,2,0,1,-2,2,-1,2,-2,1,2,-1,0,2,2,-1,-2,2,2,-1,0,1,2,-1,0,2,1,-2,0,2,-1,-1,-2,-1,0,-1,1,2,-2,0,1,-1,-2,1,1,1,0,-1,0,1,-1,2,2,-1,1,-2,-1,-1,1,0,1,0,-2,0,1,1,-2,0,1,2,0,0,1,0,1,2,-2,-2,2,2,-2,1,0,0,-1,-1,1,-1,-1,1,1,-2,-1,2,-2,0,0,-2,0,0,-1,-2,-2,2,-1,0,0,1,-2,-1,-1,0,2,-2,0,-1,2,1,0,-1,-2,1,2,1,-1,2,2,-2,-2,2,2,1,-1,2,1,1,-2,2,2,2,-2,1,-1,0,1,-1,0,-2,1,2,2,0,-1,-1,2,-2,-2,-1,-1,2,-1,-1,-1,0,0,-1,-1,1,-2,-1,2,-2,-1,0,-1,-2,-1,-2,-1,1,1,0,-2,0,-2,1,-2,1,-1,-1,0,2,2,-1,2,1,-2,1,-2,-2,-2,0,1,-1,2,0,-1,-1,2,0,2,1,1,0,1,-2,1,2,0,0,1,2,0,2,-2,-2,-1,-1,1,1,0,2,-1,1,1,-1,-2,-1,0,1,-2,1,-2,1,-1,0,2,0,-2,-2,2,-2,-1,-1,-2,-2,2,1,2,2,-1,0,-2,-1,-2,1,1,-1,2,2,2,-2,2,0,2,1,-2,-1,0,-2,-2,-1,2,2,1,0,2,2,1,0,1,-2,1,-2,0,-1,2,1,1,-2,-1,2,-1,0,-2,2,-2,-2,2,-2,0,1,-1,1,0,0,-1,-2,-1,1,1,-2,-2,0,-2,-2,2,0,-2,0,-2,1,-1,-1,2,1,-2,2,0,0,0,0,2,0,1,2,1,-1,-1,1,1,2,0,1,-1,0,1,-1,2,0,-1,-1,-2,1,-2,2,-1,1,-1,-1,-2,-2,1,0,-1,2,0,-1,2,-1,-1,-1,0,-1,0,0,-2,-2,1,1,-2,-2,-1,1,-2,-1,2,1]' },
  ],
}

export default function DuplicateSubtrees() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    step.found.forEach(id => { roles[id] = 'found' })
    if (step.current !== null) roles[step.current] = 'current'
    return <>
      <BinaryTreeLane title="Tree" root={run.root} roles={roles} note={step.phase === 'done' ? 'done' : 'post-order'} />
      <RecordStateTable label="Serialized subtrees so far" columns={['key', 'count']} rows={step.counts.slice(-6)} activeRow={step.counts.length - 1} />
      <output aria-label="Duplicates found">{step.found.length} duplicate root(s) so far</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why post-order:</strong> a node's key is only complete after both children have keys, so the walk finishes children first.</p>
  </>} />
}
