import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1295',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array of positive integers (JSON)',
  url: 'https://leetcode.com/problems/find-numbers-with-even-number-of-digits/',
  complexity: 'O(n * d) time where d is the digit count (at most 6 here), and O(1) extra space.',
  examples: [
    { label: 'Mixed lengths', input: '[12,345,2,6,7896]' },
    { label: 'Four-digit heavy', input: '[555,901,482,1771]' },
    { label: 'Growing lengths', input: '[1,22,333,4444,55555,66666]' },
    { label: 'Single value', input: '[1]' },
    { label: 'Equal values', input: '[7,7,7]' },
    { label: 'Largest values', input: '[100000,99999,1]' },
    { label: 'Long run: 200 values', input: '[11050,42160,98304,98148,65636,79042,84730,73992,85201,34991,35076,99629,60028,74356,99532,20176,70418,47053,39100,6798,3295,4309,52608,18048,17391,15785,95590,4549,55149,68965,83160,88823,50758,74117,38019,18612,5862,64581,44051,14101,43129,84032,40052,32697,11755,41619,3953,48986,23431,64601,44343,57077,99194,48368,9138,23334,99343,17010,77581,80233,14324,48764,2390,46329,22931,32650,82135,40275,95737,77719,96509,30835,4529,89345,13683,90837,61225,61794,30246,14740,4011,5334,73186,86733,94692,79899,44659,85628,58912,4171,41541,7133,78794,72899,7715,39147,32975,62687,71354,66851,7483,29946,39062,17921,58522,10385,10530,76545,10103,57888,80524,49982,87839,46083,42462,88501,12350,67926,46501,1922,49792,31284,80812,82465,6256,16218,31488,8781,15452,41316,10029,14275,91214,93389,83583,41439,89202,50162,94370,15933,37942,45199,60417,82392,22788,52800,78217,12909,41225,30721,28294,75736,97872,61741,40996,72629,9511,68641,41230,48831,65720,66393,337,44883,20496,55248,11289,53741,75643,66627,26801,81513,24964,99662,56294,37314,51704,89421,58757,56885,93827,24411,61623,62686,24017,2486,54123,67640,2029,80728,42155,36641,62724,90717,53668,78803,12610,17795,18306,2315]' },
  ],
}

export default function EvenDigitCount() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { index, value, digits, verdict, count, digitCounts } = step.snapshot
    return <>
      <div role="img" aria-label="Numbers and their digit counts" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {run.input.map((v, i) => {
          const done = i < digitCounts.length
          const isCurrent = i === index
          return <div key={i} data-index={i} style={{
            minWidth: 64, padding: 12, boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace',
            border: `${isCurrent ? 2 : 1}px solid ${isCurrent ? 'var(--text)' : 'var(--border)'}`,
            background: done && digitCounts[i] % 2 === 0 ? 'color-mix(in srgb, var(--success) 18%, var(--surface2))' : done ? 'var(--surface)' : 'transparent', color: 'var(--text-muted)',
          }}><div>{v}</div><small>{done ? `${digitCounts[i]} digits` : '...'}</small></div>
        })}
      </div>
      <p>{index === null ? 'No number is under inspection.' : `Number ${value}: ${digits} digit(s) counted${verdict ? `, ${verdict}` : ''}.`}</p>
      <p>Even-digit count so far: <strong>{count}</strong></p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Count digits, not magnitude:</strong> the question is about how many digits a number has, so the algorithm counts them by repeated division by ten.</p>
    <p><strong>Parity of the count:</strong> only the final digit count is tested for evenness; the value itself is never compared.</p>
  </>} />
}
