import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  parse: parseInput, build: buildTrace, code, python,
  phases: [
    { id: 'start', label: 'First array', description: 'Track the range of the first array.' },
    { id: 'compare', label: 'Compare', description: 'Pair the current array with the earlier extremes.' },
    { id: 'update', label: 'Update range', description: 'Widen the tracked extremes.' },
    { id: 'done', label: 'Complete', description: 'Return the best distance.' },
  ],
  inputLabel: 'Arrays (JSON array of arrays)',
  url: 'https://leetcode.com/problems/maximum-distance-in-arrays/',
  complexity: 'O(total length) time and O(1) extra space: only the running minimum and maximum are kept.',
  examples: [
    { label: 'Two arrays', input: '[[1,2,3],[4,5],[1,2,3]]' },
    { label: 'Negative', input: '[[1],[-1]]' },
    { label: 'Three arrays', input: '[[1,4],[0,5],[-3,6]]' },
    { label: 'Single values in each array', input: '[[1],[2]]' },
    { label: 'Equal arrays make a zero-width tie', input: '[[5,5],[5,5]]' },
    { label: 'Extreme values at the limits', input: '[[-10000,10000],[-10000,10000]]' },
    { label: 'Long run: 12 arrays of 20 values', input: '[[7170,9179,-2272,5457,-2634,4355,-5140,7898,5184,-1778,-9480,-7682,1950,4720,-5661,9807,-198,-7795,-6306,-4269],[7607,7310,-3247,-6271,-263,-5995,-9246,-5941,-8815,-7906,3541,-8375,3969,-5510,-3731,-4281,436,3385,-4742,1136],[8043,5441,-4223,2002,2109,3656,6649,221,-2813,5968,-3439,-9068,5988,4261,-1801,1632,1070,-5436,-3177,6542],[8480,3571,-5198,-9726,4480,-6694,2543,6384,3189,-160,9582,-9761,8007,-5968,129,7545,1704,5744,-1613,-8054],[8917,1702,-6174,-1453,6851,2957,-1563,-7455,9191,-6287,2602,9547,-9975,3803,2059,-6543,2338,-3077,-49,-2648],[9353,-167,-7149,6820,9223,-7393,-5669,-1293,-4808,7586,-4378,8854,-7957,-6427,3989,-630,2972,8103,1515,2757],[9790,-2036,-8125,-4908,-8407,2258,-9775,4870,1194,1459,8642,8161,-5938,3345,5919,5283,3606,-718,3079,8163],[-9774,-3906,-9100,3365,-6035,-8092,6120,-8969,7196,-4669,1662,7468,-3919,-6885,7849,-8805,4240,-9539,4644,-6433],[-9338,-5775,9925,-8363,-3664,1559,2014,-2807,-6803,9204,-5318,6775,-1900,2886,9779,-2893,4874,1641,6208,-1028],[-8901,-7644,8950,-90,-1293,-8791,-2092,3356,-801,3077,7703,6082,119,-7343,-8292,3020,5508,-7180,7772,4378],[-8465,-9514,7975,8183,1079,860,-6198,9518,5201,-3051,723,5389,2137,2428,-6362,8933,6142,4000,9336,9783],[-8028,8618,6999,-3545,3450,-9490,9697,-4321,-8798,-9178,-6258,4696,4156,-7802,-4432,-5155,6776,-4821,-9101,-4812]]' },
  ],
}

const W = 560
const ROW = 34

// One row per array as a bar from its minimum to its maximum, on a shared value axis.
function RangeChart({ arrays, current, lo, hi }) {
  const all = arrays.flat()
  const min = Math.min(...all), max = Math.max(...all)
  const span = Math.max(1, max - min)
  const x = v => 70 + ((v - min) / span) * (W - 100)
  const height = arrays.length * ROW + 40
  return <svg role="img" aria-label="Value range of each array" viewBox={`0 0 ${W} ${height}`} width="100%" style={{ maxWidth: W, display: 'block' }}>
    {arrays.map((a, i) => {
      const y = 20 + i * ROW
      const isCur = i === current
      return <g key={i} data-array={i}>
        <text x={8} y={y + 12} fill="var(--text)" fontSize={13} fontFamily="monospace">array {i}</text>
        <line x1={x(Math.min(...a))} x2={x(Math.max(...a))} y1={y + 8} y2={y + 8} stroke={isCur ? 'var(--primary)' : 'var(--text)'} strokeWidth={isCur ? 8 : 4} strokeLinecap="round" />
        <text x={x(Math.min(...a)) - 4} y={y + 2} textAnchor="end" fill="var(--text)" fontSize={11}>{Math.min(...a)}</text>
        <text x={x(Math.max(...a)) + 4} y={y + 2} fill="var(--text)" fontSize={11}>{Math.max(...a)}</text>
      </g>
    })}
    {lo !== null && <g aria-label="Earlier minimum and maximum">
      <line x1={x(lo)} x2={x(lo)} y1={12} y2={height - 16} stroke="var(--primary)" strokeDasharray="4 3" />
      <line x1={x(hi)} x2={x(hi)} y1={12} y2={height - 16} stroke="var(--primary)" strokeDasharray="4 3" />
      <text x={x(lo)} y={height - 4} textAnchor="middle" fill="var(--text)" fontSize={11}>lo {lo}</text>
      <text x={x(hi)} y={height - 4} textAnchor="middle" fill="var(--text)" fontSize={11}>hi {hi}</text>
    </g>}
  </svg>
}

export default function MaxDistanceArrays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <RangeChart arrays={run.input} current={step.array} lo={step.lo ?? null} hi={step.hi ?? null} />
    <output aria-label="Tracked range" style={{ display: 'block', color: 'var(--text)', marginTop: 8 }}>
      Earlier range: [{step.lo}, {step.hi}] · best {step.best ?? '—'}{step.pair ? ` · pair ${step.pair.join(' and ')}` : ''}
    </output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why extremes suffice:</strong> for a fixed later value, the farthest earlier value is either the smallest or the largest, so two numbers capture every earlier array.</p>
  </>} />
}
