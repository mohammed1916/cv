import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Root', description: 'Begin at the root.' },
    { id: 'visit', label: 'Compare and move', description: 'Equal means found; smaller goes left; larger goes right.' },
    { id: 'done', label: 'Result', description: 'Return the subtree at the match, or null.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'BST and value (JSON object with root and val)',
  url: 'https://leetcode.com/problems/search-in-a-binary-search-tree/',
  complexity: 'O(h) time for height h, and O(1) extra space for the iterative walk.',
  examples: [
    { label: 'Found', input: '{"root":[8,3,10,1,6,null,14],"val":6}' },
    { label: 'Left side', input: '{"root":[8,3,10,1,6,null,14],"val":1}' },
    { label: 'Missing', input: '{"root":[8,3,10,1,6,null,14],"val":7}' },
    { label: 'Root only, value found', input: '{"root":[4],"val":4}' },
    { label: 'Root only, value missing', input: '{"root":[4],"val":9}' },
    { label: 'Extreme values', input: '{"root":[-10000,null,10000],"val":10000}' },
    { label: 'Long run: 60 nodes', input: '{"root":[147,-7694,5424,-9612,-1907,1587,8210,null,-8607,-6851,-1666,438,2168,5915,8943,-9248,-7879,-6940,-2141,-1723,-1125,249,1264,2155,3315,5628,6709,8314,9038,null,-9230,-8169,null,-7460,null,-2176,null,null,-1668,null,null,null,null,664,1297,1906,null,3140,3791,null,5897,6504,7032,null,null,null,9525,null,null,null,null,null,null,-4285,null,null,null,null,993,null,1467,null,null,null,null,null,5250,null,null,6017,6694,null,7787,9169,9756,-6184,-2996,810,null,null,null,null,null,null,null,null,null,null,7895,null,null,null,null,null,-4958,-3908,-2423,null,null,null,null,-5773,null,null,null,null,null,-5835],"val":9038}' },
  ],
}

export default function SearchBst() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    if (step.node !== null && step.node !== undefined) roles[step.node] = step.found !== null ? 'found' : 'current'
    return <>
      <BinaryTreeLane title="Binary search tree" root={run.tree} roles={roles}
        note={step.phase === 'done' ? (step.result ? `subtree ${step.result.join(', ')}` : 'not present') : `looking for ${step.val}`} />
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why one path:</strong> each comparison discards one whole side of the tree, so only one root-to-leaf path needs checking.</p>
  </>} />
}
