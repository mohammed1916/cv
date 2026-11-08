import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Position 0: keep costs 0, swap costs 1.' },
    { id: 'step', label: 'Step', description: 'Each position reads the states of the position before it.' },
    { id: 'done', label: 'Complete', description: 'The cheaper of the two final states is the answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'a and b (JSON object of two arrays)',
  url: 'https://leetcode.com/problems/minimum-swaps-to-make-sequences-increasing/',
  complexity: 'O(n) time and O(1) extra space.',
  examples: [
    { label: 'One swap', input: '{"a":[1,5,4,6],"b":[2,3,7,8]}' },
    { label: 'Already rising', input: '{"a":[2,4,6,7],"b":[3,5,6,9]}' }, { label: 'Equal positions', input: '{"a":[1,2],"b":[1,2]}' }, { label: 'All values equal', input: '{"a":[1,1,1],"b":[1,1,1]}' }, { label: 'Long run: 60 positions', input: '{"a":[7,30,83,109,130,164,202,234,241,275,323,347,375,396,428,470,491,531,563,580,618,640,683,703,725,753,785,831,861,884,906,950,973,1008,1022,1069,1100,1115,1162,1178,1218,1245,1284,1304,1322,1351,1388,1424,1463,1491,1517,1554,1568,1604,1627,1665,1690,1720,1741,1778],"b":[11,50,72,107,125,164,204,228,252,283,309,341,372,396,421,457,493,529,546,574,611,639,661,701,725,764,804,830,849,880,913,934,982,993,1044,1063,1093,1120,1162,1170,1218,1251,1279,1308,1337,1351,1394,1425,1442,1494,1509,1540,1561,1604,1643,1658,1701,1732,1740,1775]}' },
  ],
}

export default function MinSwapIncreasing() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="a" length={run.input.a.length} valueAt={k => run.input.a[k]} active={step.i ?? -1} />
    <IndexedSequence label="b" length={run.input.b.length} valueAt={k => run.input.b[k]} active={step.i ?? -1} />
    <RecordStateTable label="Pairs and the cost of each choice" columns={['i', 'a[i]', 'b[i]', 'keep', 'swap']}
      rows={step.rows.map(r => ({ i: r.i, 'a[i]': r.a, 'b[i]': r.b, keep: r.keep === Infinity ? '–' : r.keep, swap: r.swap === Infinity ? '–' : r.swap }))}
      activeRow={step.rows.length - 1} />
    <output aria-label="Step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Each position keeps its pair or swaps it. Keeping is allowed after a kept pair only if both values rise, and after a swapped pair only if the crossed values rise.</p>
    <p>The table records the cheapest cost of each state, and the answer is the cheaper final state.</p>
  </>} />
}
