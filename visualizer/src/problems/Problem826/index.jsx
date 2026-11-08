import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Sort', description: 'Sort jobs by difficulty and workers by ability.' },
    { id: 'absorb', label: 'Unlock job', description: 'Advance the pointer over jobs the worker can do and update the best profit.' },
    { id: 'pay', label: 'Assign worker', description: 'The worker earns the best profit among reachable jobs.' },
    { id: 'done', label: 'Complete', description: 'Return the summed profit.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Object with difficulty, profit, worker (JSON)',
  url: 'https://leetcode.com/problems/most-profit-assigning-work/',
  complexity: 'O(n log n + m log m) time for sorting; the two-pointer sweep is O(n + m).',
  examples: [
    { label: 'Own case 1', input: '{"difficulty":[3,5,7,9,11],"profit":[11,21,31,41,51],"worker":[5,6,7,8]}' },
    { label: 'Too hard', input: '{"difficulty":[85,47,57],"profit":[24,66,99],"worker":[40,25,25]}' },
    { label: 'Profit not monotone', input: '{"difficulty":[1,2,3],"profit":[50,10,5],"worker":[1,2,3]}' },
    { label: 'One job, one worker', input: '{"difficulty":[1],"profit":[1],"worker":[1]}' },
    { label: 'Equal difficulties, keep best profit', input: '{"difficulty":[3,3],"profit":[5,9],"worker":[3,3]}' },
    { label: 'Largest values', input: '{"difficulty":[100000],"profit":[100000],"worker":[100000]}' },
    { label: 'Long run: 30 jobs, 30 workers', input: '{"difficulty":[14810,54403,15544,55132,21518,22291,2236,32512,15408,41572,52432,24279,48975,10868,46083,25344,49445,16904,53889,59042,23796,8282,63444,32628,14363,38273,26845,62984,25210,39328],"profit":[15760,30426,57484,41679,56947,51228,47933,28105,56788,4159,12688,42330,10445,31041,26610,38022,19449,48313,45403,53113,18419,25764,20010,32563,12690,19693,15549,48112,39399,45502],"worker":[30675,8792,31219,54921,48803,36715,7720,4565,49848,44842,19878,51657,22419,51718,43314,44409,65535,64778,65014,14068,62770,51399,2043,16906,33704,41731,57447,17373,22975,63264]}' },
  ],
}
export default function MostProfitAssigningWork() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Jobs sorted by difficulty (difficulty/profit)" length={run.jobs.length} active={step.phase === 'absorb' ? step.i : -1}
      valueAt={i => `${run.jobs[i][0]}/${run.jobs[i][1]}`} roleAt={i => i === step.i && step.phase === 'absorb' ? 'job pointer' : i < step.i ? 'unlocked' : ''} />
    <IndexedSequence label="Workers sorted by ability" length={run.workers.length} active={step.w} valueAt={i => run.workers[i]} roleAt={i => i === step.w ? 'worker pointer' : i < step.w || step.phase === 'done' ? 'paid' : ''} />
    <output aria-label="Profit">Best reachable profit {step.best} | total {step.total}</output>
  </>} renderReasoning={() => <>
    <p>Any worker may take any job at or below their ability, and the same job can be reused. So each worker simply wants the highest profit among jobs they can do.</p>
    <p>Sorting workers means the reachable job set only grows, so one pointer and a running maximum suffice.</p>
  </>} />
}
