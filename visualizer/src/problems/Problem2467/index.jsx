import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Bob', description: 'Bob walks from his start toward node 0.' },
    { id: 'alice', label: 'Alice', description: 'Alice walks down; a node pays by who arrives first.' },
    { id: 'leaf', label: 'Leaf', description: 'A leaf completes one of Alice’s candidate paths.' },
    { id: 'done', label: 'Complete', description: 'Report the best total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with edges, bob and amount (JSON)',
  url: 'https://leetcode.com/problems/most-profitable-path-in-a-tree/',
  complexity: 'O(n) time and O(n) space. The visualization caps input at 12 nodes.',
  examples: [
    { label: 'Example 1', input: '{"edges":[[0,1],[1,2],[1,3],[3,4]],"bob":3,"amount":[-2,4,2,-4,6]}' },
    { label: 'Example 2', input: '{"edges":[[0,1]],"bob":1,"amount":[-7280,2350]}' },
    { label: 'Two nodes', input: '{"edges":[[0,1]],"bob":0,"amount":[2,-4]}' },
    { label: 'Equal amounts', input: '{"edges":[[0,1],[0,2]],"bob":2,"amount":[4,4,4]}' },
    { label: 'Largest values', input: '{"edges":[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[10,11]],"bob":11,"amount":[10000,-10000,10000,-10000,10000,-10000,10000,-10000,10000,-10000,10000,-10000]}' },
    { label: 'Long run: 12 nodes', input: '{"edges":[[0,1],[1,2],[1,3],[0,4],[4,5],[0,6],[6,7],[5,8],[7,9],[7,10],[9,11]],"bob":3,"amount":[1214,-3792,-4506,3436,4178,-2042,-1812,-1254,-3228,3816,1968,-4612]}' },
  ],
}

export default function MostProfitablePath() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Amount at each node" length={run.input.amount.length} valueAt={i => run.input.amount[i]} roleAt={i => (i === step.node ? 'Alice' : (run.bobTime[i] !== Infinity ? `Bob at ${run.bobTime[i]}` : ''))} active={step.node} />
    <output aria-label="Best">{`Best total so far: ${step.best ?? '—'}`}</output>
  </>} renderReasoning={() => <>
    <p>Bob's arrival time at a node on his path is his distance from his start, and nodes off that path are never reached by him.</p>
    <p>Alice's arrival time is her depth, so each node pays the full amount, half, or nothing depending on who arrives first.</p>
  </>} />
}
